import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', confirmClass = 'btn-danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className={confirmClass}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
