
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, UserPlus, Trash2, Edit2 } from 'lucide-react';

const OperatorManager = ({ currentOperator, operators, onSetCurrentOperator, onSetOperators, initialOperatorName }) => {
  const [newOperatorName, setNewOperatorName] = useState('');
  const [editingOperator, setEditingOperator] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAddOperator = () => {
    if (newOperatorName.trim() && !operators.includes(newOperatorName.trim())) {
      const updatedOperators = [...operators, newOperatorName.trim()];
      onSetOperators(updatedOperators);
      onSetCurrentOperator(newOperatorName.trim());
      setNewOperatorName('');
    } else if (operators.includes(newOperatorName.trim())) {
      alert('Este nome de operador já existe.');
    }
  };

  const handleDeleteOperator = (operatorToDelete) => {
    if (operatorToDelete === initialOperatorName) {
      alert(`O operador "${initialOperatorName}" não pode ser removido.`);
      return;
    }
    if (operators.length <= 1) {
      alert('Deve haver pelo menos um operador.');
      return;
    }
    
    try {
      // Criar uma nova lista sem o operador a ser removido
      const updatedOperators = operators.filter(op => op !== operatorToDelete);
      
      // Atualizar o estado dos operadores
      onSetOperators(updatedOperators);
      
      // Se o operador atual for o que está sendo removido, selecionar outro
      if (currentOperator === operatorToDelete) {
        onSetCurrentOperator(updatedOperators.length > 0 ? updatedOperators[0] : initialOperatorName);
      }
      
      // Feedback visual para o usuário
      alert(`Operador "${operatorToDelete}" removido com sucesso.`);
    } catch (error) {
      console.error('Erro ao remover operador:', error);
      alert('Ocorreu um erro ao remover o operador. Tente novamente.');
    }
  };
  
  const handleStartEdit = (operatorName) => {
    setEditingOperator(operatorName);
    setEditName(operatorName);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && !operators.includes(editName.trim()) || editName.trim() === editingOperator) {
      const updatedOperators = operators.map(op => op === editingOperator ? editName.trim() : op);
      onSetOperators(updatedOperators);
      if (currentOperator === editingOperator) {
        onSetCurrentOperator(editName.trim());
      }
      setEditingOperator(null);
      setEditName('');
    } else {
      alert('Nome de operador inválido ou já existente.');
    }
  };


  return (
    <div className="operator-manager-card">
      <h3 className="text-lg font-semibold text-center mb-4 text-primary">Gerenciar Operador</h3>
      <div className="mb-4">
        <label htmlFor="operatorSelect" className="text-sm text-muted-foreground block mb-1">Operador Atual:</label>
        <div className="flex items-center gap-2">
          <select
            id="operatorSelect"
            value={currentOperator}
            onChange={(e) => onSetCurrentOperator(e.target.value)}
            className="arkos-input w-full p-2.5 rounded-md text-base"
          >
            {operators.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
          {currentOperator !== initialOperatorName && editingOperator !== currentOperator && (
             <Button variant="ghost" size="icon" onClick={() => handleStartEdit(currentOperator)} className="text-muted-foreground hover:text-primary">
                <Edit2 size={18}/>
             </Button>
          )}
        </div>
      </div>

      {editingOperator && (
        <div className="mb-4 p-3 bg-primary/10 rounded-md">
          <h4 className="text-sm font-medium mb-2 text-primary">Editando: {editingOperator}</h4>
          <Input 
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Novo nome do operador"
            className="arkos-input mb-2"
          />
          <div className="flex gap-2">
            <Button onClick={handleSaveEdit} size="sm" className="arkos-button-primary flex-1">Salvar</Button>
            <Button onClick={() => setEditingOperator(null)} size="sm" variant="outline" className="flex-1">Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Adicionar Novo Operador:</p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newOperatorName}
            onChange={(e) => setNewOperatorName(e.target.value)}
            placeholder="Nome do novo operador"
            className="arkos-input flex-grow p-2.5 text-base"
          />
          <Button onClick={handleAddOperator} className="arkos-button-primary" aria-label="Adicionar Operador">
            <UserPlus size={20} />
          </Button>
        </div>
      </div>

      {operators.filter(op => op !== initialOperatorName).length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-1">Remover Operador:</p>
          <div className="max-h-20 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {operators.filter(op => op !== initialOperatorName).map(op => (
              op !== editingOperator && (
                <div key={op} className="flex items-center justify-between text-sm p-1.5 bg-secondary/50 rounded">
                  <span>{op}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleStartEdit(op)} className="h-6 w-6 text-muted-foreground hover:text-primary">
                        <Edit2 size={14}/>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteOperator(op)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                        <Trash2 size={14}/>
                    </Button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorManager;
