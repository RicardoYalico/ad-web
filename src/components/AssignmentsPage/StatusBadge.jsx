const StatusBadge = ({ status }) => {
    if (!status) return null;

    const styles = {
        NUEVO: 'bg-green-100 text-green-800',
        MODIFICADO: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
};

export default StatusBadge;