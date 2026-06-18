import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';

const FIELD_TYPES = ['text', 'number', 'date', 'dropdown', 'checkbox', 'textarea'];

function SortableField({ field, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const typeColors = {
    text: 'bg-blue-100 text-blue-700', number: 'bg-purple-100 text-purple-700',
    date: 'bg-orange-100 text-orange-700', dropdown: 'bg-green-100 text-green-700',
    checkbox: 'bg-pink-100 text-pink-700', textarea: 'bg-gray-100 text-gray-700'
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 mb-2">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800 text-sm truncate">{field.label}</span>
          {field.isRequired && <span className="text-red-500 text-xs">*required</span>}
        </div>
        <span className="text-xs text-gray-400">{field.fieldKey}</span>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[field.fieldType]}`}>
        {field.fieldType}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(field)} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(field._id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function FieldManager({ formType, isOpen, onClose }) {
  const qc = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editField, setEditField] = useState(null);
  const [form, setForm] = useState({ label: '', fieldType: 'text', options: '', isRequired: false });
  const [optionsInput, setOptionsInput] = useState('');

  const queryKey = ['fields', formType];
  const { data: fields = [] } = useQuery({
    queryKey,
    queryFn: () => api.get(`/fields/${formType}`).then(r => r.data),
    enabled: isOpen
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const createMutation = useMutation({
    mutationFn: data => api.post(`/fields/${formType}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey }); toast.success('Field added'); resetForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/fields/${formType}/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey }); toast.success('Field updated'); setEditField(null); resetForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/fields/${formType}/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey }); toast.success('Field removed'); }
  });

  const reorderMutation = useMutation({
    mutationFn: orderedIds => api.put(`/fields/${formType}/reorder`, { orderedIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey })
  });

  const resetForm = () => {
    setForm({ label: '', fieldType: 'text', options: '', isRequired: false });
    setOptionsInput('');
    setShowAddForm(false);
  };

  const handleEdit = (field) => {
    setEditField(field);
    setForm({ label: field.label, fieldType: field.fieldType, isRequired: field.isRequired });
    setOptionsInput((field.options || []).join(', '));
    setShowAddForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      label: form.label,
      fieldType: form.fieldType,
      isRequired: form.isRequired,
      options: form.fieldType === 'dropdown' ? optionsInput.split(',').map(s => s.trim()).filter(Boolean) : []
    };
    if (editField) {
      updateMutation.mutate({ id: editField._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex(f => f._id === active.id);
      const newIndex = fields.findIndex(f => f._id === over.id);
      const newOrder = arrayMove(fields, oldIndex, newIndex);
      qc.setQueryData(queryKey, newOrder);
      reorderMutation.mutate(newOrder.map(f => f._id));
    }
  };

  const formTypeLabels = { 'patient-in': 'Patient In', 'patient-out': 'Patient Out', 'follow-up': 'Follow-Up' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Fields — ${formTypeLabels[formType]}`} size="lg">
      <div className="space-y-4">
        {fields.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No custom fields yet. Add one below.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(f => f._id)} strategy={verticalListSortingStrategy}>
              {fields.map(field => (
                <SortableField
                  key={field._id}
                  field={field}
                  onEdit={handleEdit}
                  onDelete={id => deleteMutation.mutate(id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {showAddForm ? (
          <form onSubmit={handleSubmit} className="border-2 border-primary-100 bg-primary-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">
              {editField ? 'Edit Field' : 'Add New Field'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Field Label *</label>
                <input
                  className="input"
                  placeholder="e.g. Sobriety Level"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Field Type *</label>
                <select className="input" value={form.fieldType} onChange={e => setForm(f => ({ ...f, fieldType: e.target.value }))}>
                  {FIELD_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              {form.fieldType === 'dropdown' && (
                <div className="sm:col-span-2">
                  <label className="label">Options (comma-separated)</label>
                  <input
                    className="input"
                    placeholder="e.g. Low, Medium, High"
                    value={optionsInput}
                    onChange={e => setOptionsInput(e.target.value)}
                  />
                </div>
              )}
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={form.isRequired}
                  onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600"
                />
                <label htmlFor="isRequired" className="text-sm text-gray-700">Mark as required</label>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                {editField ? 'Update' : 'Add Field'}
              </button>
              <button type="button" onClick={() => { resetForm(); setEditField(null); }} className="btn-ghost text-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add New Field
          </button>
        )}
      </div>
    </Modal>
  );
}
