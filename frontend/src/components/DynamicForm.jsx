export default function DynamicForm({ fields = [], values = {}, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...values, [key]: value });
  };

  if (!fields || fields.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Additional Fields
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(field => (
            <div key={field._id} className={field.fieldType === 'textarea' ? 'sm:col-span-2' : ''}>
              <label className="label">
                {field.label}
                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <FieldInput
                field={field}
                value={values[field.fieldKey] ?? ''}
                onChange={val => handleChange(field.fieldKey, val)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  switch (field.fieldType) {
    case 'text':
      return <input type="text" className="input" value={value} onChange={e => onChange(e.target.value)} />;
    case 'number':
      return <input type="number" className="input" value={value} onChange={e => onChange(e.target.value)} />;
    case 'date':
      return <input type="date" className="input" value={value} onChange={e => onChange(e.target.value)} />;
    case 'textarea':
      return <textarea className="input min-h-[80px] resize-y" rows={3} value={value} onChange={e => onChange(e.target.value)} />;
    case 'dropdown':
      return (
        <select className="input" value={value} onChange={e => onChange(e.target.value)}>
          <option value="">Select...</option>
          {(field.options || []).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'checkbox':
      return (
        <div className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            id={field.fieldKey}
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor={field.fieldKey} className="text-sm text-gray-700">{field.label}</label>
        </div>
      );
    default:
      return <input type="text" className="input" value={value} onChange={e => onChange(e.target.value)} />;
  }
}
