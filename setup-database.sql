-- Script para configurar as tabelas do Sistema ARKOS no Supabase

-- 1. Tabela de coleções (collections)
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    period TEXT NOT NULL,
    date TEXT NOT NULL,
    packages JSONB DEFAULT '[]',
    duplicates JSONB DEFAULT '[]',
    total_packages INTEGER DEFAULT 0,
    total_duplicates INTEGER DEFAULT 0,
    operator_name TEXT,
    operator_id TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de atividades (activities)
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 3. Tabela de usuários online (online_users)
CREATE TABLE IF NOT EXISTS online_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    display_name TEXT,
    email TEXT,
    online BOOLEAN DEFAULT true,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de calendário (calendar_events)
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('romaneio_ok', 'dispatch_failure')),
    user_id TEXT,
    user_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, type)
);

-- 5. Tabela de configurações do sistema (system_config)
CREATE TABLE IF NOT EXISTS system_config (
    id TEXT PRIMARY KEY DEFAULT 'main',
    sound_enabled BOOLEAN DEFAULT true,
    auto_save BOOLEAN DEFAULT true,
    trello_integration BOOLEAN DEFAULT false,
    trello_api_key TEXT,
    trello_board_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_collections_store_date ON collections(store_name, date);
CREATE INDEX IF NOT EXISTS idx_collections_period ON collections(period);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_online_users_online ON online_users(online);
CREATE INDEX IF NOT EXISTS idx_online_users_last_active ON online_users(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(type);

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público (para o sistema funcionar)
CREATE POLICY "Allow public read access to collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to collections" ON collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to collections" ON collections FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to activities" ON activities FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to online_users" ON online_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to online_users" ON online_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to online_users" ON online_users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to calendar_events" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to calendar_events" ON calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to calendar_events" ON calendar_events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to calendar_events" ON calendar_events FOR DELETE USING (true);

CREATE POLICY "Allow public read access to system_config" ON system_config FOR SELECT USING (true);
CREATE POLICY "Allow public update access to system_config" ON system_config FOR UPDATE USING (true);

-- Inserir configuração padrão do sistema
INSERT INTO system_config (id, sound_enabled, auto_save, trello_integration) 
VALUES ('main', true, true, false)
ON CONFLICT (id) DO NOTHING;

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar usuários offline antigos
CREATE OR REPLACE FUNCTION cleanup_offline_users()
RETURNS void AS $$
BEGIN
    DELETE FROM online_users 
    WHERE last_active < NOW() - INTERVAL '1 hour' 
    AND online = false;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE collections IS 'Tabela para armazenar as coleções de pacotes do sistema ARKOS';
COMMENT ON TABLE activities IS 'Tabela para registrar atividades do sistema em tempo real';
COMMENT ON TABLE online_users IS 'Tabela para controlar usuários online no sistema';
COMMENT ON TABLE calendar_events IS 'Tabela para eventos do calendário de romaneio';
COMMENT ON TABLE system_config IS 'Tabela para configurações do sistema ARKOS'; 