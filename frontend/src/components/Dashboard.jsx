const Dashboard = ({ user: initialUser, onLogout }) => {
    const [user, setUser] = useState(initialUser);
    const [activeTab, setActiveTab] = useState('new');
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchTickets();
        fetchStats();
        if (user.role === 'SUPERADMIN') fetchUsers();
    }, [user]);

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://127.0.0.1:3000/api/tickets', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await response.json();
            if (response.ok) setTickets(data);
        } catch (err) { console.error('Error fetching tickets', err); }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('http://127.0.0.1:3000/api/tickets/stats', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await response.json();
            if (response.ok) setStats(data);
        } catch (err) { console.error('Error fetching stats', err); }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://127.0.0.1:3000/api/auth/users', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await response.json();
            if (response.ok) setUsers(data);
        } catch (err) { console.error('Error fetching users', err); }
    };

    const handleProfileUpdate = (updatedData) => {
        setUser({ ...user, ...updatedData });
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                style={{ width: '280px', background: 'var(--primary-earth)', color: 'white', padding: '2rem', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                    ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                    )}
                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem' }}>PQR-Crismor</h2>
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Bienvenido,</p>
                    <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>{user.username}</p>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '10px' }}>{user.role}</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <TabButton active={activeTab === 'new'} onClick={() => setActiveTab('new')} label="🎫 Nuevo PQR" />
                    <TabButton active={activeTab === 'follow'} onClick={() => setActiveTab('follow')} label="📋 Gestión y Seguimiento" />
                    <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="📊 Informes" />
                    <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="📈 Estadísticas" />
                    <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="👤 Mi Perfil" />
                </nav>

                <button
                    onClick={onLogout}
                    className="btn-outline"
                    style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'white', marginTop: '2rem' }}
                >
                    Cerrar Sesión
                </button>
            </motion.div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {activeTab === 'new' && <NewTicketForm user={user} onSuccess={() => { fetchTickets(); setActiveTab('follow'); }} />}
                        {activeTab === 'follow' && <TicketList tickets={tickets} user={user} users={users} onUpdate={fetchTickets} />}
                        {activeTab === 'stats' && <StatsView stats={stats} />}
                        {activeTab === 'reports' && <ReportsView tickets={tickets} user={user} />}
                        {activeTab === 'profile' && <ProfileView user={user} onUpdate={handleProfileUpdate} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label }) => (
    <motion.button
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            padding: '1rem',
            textAlign: 'left',
            borderRadius: '12px',
            background: active ? 'white' : 'transparent',
            color: active ? 'var(--primary-earth)' : 'white',
            fontWeight: active ? '600' : '400',
            transition: 'background 0.3s, color 0.3s'
        }}
    >
        {label}
    </motion.button>
);

const NewTicketForm = ({ user, onSuccess }) => {
    const [formData, setFormData] = useState({
        patientName: '', contactMethod: '', city: '', phone: '', email: '', description: ''
    });
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        photos.forEach(photo => data.append('photos', photo));

        try {
            const response = await fetch('http://127.0.0.1:3000/api/tickets', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` },
                body: data
            });
            if (response.ok) onSuccess();
        } catch (err) { alert('Error al crear ticket'); }
        finally { setLoading(false); }
    };

    return (
        <div className="glass-card" style={{ maxWidth: '800px' }}>
            <h3 style={{ marginBottom: '2rem' }}>Registrar Nuevo Caso</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label">Nombre del Paciente</label>
                        <input className="input-field" value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Ciudad</label>
                        <input className="input-field" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Medio de Contacto</label>
                        <input className="input-field" value={formData.contactMethod} onChange={e => setFormData({ ...formData, contactMethod: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <input className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Correo</label>
                        <input className="input-field" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Descripción del Caso</label>
                    <textarea
                        className="input-field"
                        style={{ height: '100px', resize: 'vertical' }}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Fotos de Referencia (Máx 3)</label>
                    <input type="file" multiple onChange={e => setPhotos([...e.target.files].slice(0, 3))} />
                </div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem 3rem' }}>
                    {loading ? 'Generando...' : 'Generar Ticket'}
                </button>
            </form>
        </div>
    );
};

const TicketList = ({ tickets, user, users, onUpdate }) => {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reassigning, setReassigning] = useState(null);

    const handleReassign = async (ticketId, userId) => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketId}/reassign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify({ assignedToId: userId })
            });
            if (response.ok) {
                setReassigning(null);
                onUpdate();
            }
        } catch (err) { alert('Error al reasignar'); }
    };

    return (
        <div>
            <h3 style={{ marginBottom: '2rem' }}>Gestión de Casos ({tickets.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tickets.map((t, idx) => {
                    const isOwner = t.assignedToId === user.id || user.role === 'SUPERADMIN';
                    return (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card"
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem' }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.3rem' }}>
                                    <p style={{ fontWeight: '600', color: 'var(--primary-earth)', margin: 0 }}>{t.id}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gestor: {t.assignedTo?.username || 'Sin asignar'}</span>
                                </div>
                                <p style={{ fontWeight: '500', marginBottom: '0.3rem' }}>{t.patientName}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.city} • {new Date(t.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <span className={`status-badge status-${t.status.toLowerCase()}`}>{t.status}</span>

                                {user.role === 'SUPERADMIN' && (
                                    <div style={{ position: 'relative' }}>
                                        <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setReassigning(reassigning === t.id ? null : t.id)}>
                                            Reasignar
                                        </button>
                                        <AnimatePresence>
                                            {reassigning === t.id && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'absolute', top: '110%', right: 0, background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '10px', zIndex: 10, width: '180px', padding: '0.5rem' }}>
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', padding: '0 0.5rem' }}>Asignar a:</p>
                                                    {users.map(u => (
                                                        <button key={u.id} style={{ width: '100%', textAlign: 'left', padding: '0.5rem', borderRadius: '5px', background: t.assignedToId === u.id ? 'var(--pale-green)' : 'none', fontSize: '0.85rem' }} onClick={() => handleReassign(t.id, u.id)}>
                                                            {u.username}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {isOwner ? (
                                    <button className="btn-primary" style={{ padding: '0.5rem 1.2rem' }} onClick={() => setSelectedTicket(t)}>Gestionar</button>
                                ) : (
                                    <button className="btn-outline" style={{ padding: '0.5rem 1.2rem', opacity: 0.5, cursor: 'not-allowed' }} disabled>Lectura</button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {selectedTicket && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ background: 'white', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h4>Gestión de Ticket: {selectedTicket.id}</h4>
                                <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', fontSize: '1.5rem', opacity: 0.5 }}>✕</button>
                            </div>
                            <FollowUpForm ticket={selectedTicket} user={user} onDone={() => { setSelectedTicket(null); onUpdate(); }} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FollowUpForm = ({ ticket, user, onDone }) => {
    const [form, setForm] = useState({ content: '', diagnosis: '', protocol: '', bonusInfo: '', status: ticket.status });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await fetch(`http://127.0.0.1:3000/api/tickets/${ticket.id}/follow-up`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(form)
            });
            onDone();
        } catch (err) { alert('Error al actualizar'); }
        finally { setSubmitting(false); }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Diagnóstico</label>
                    <input className="input-field" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Bonificación/Obsequio</label>
                    <input className="input-field" value={form.bonusInfo} onChange={e => setForm({ ...form, bonusInfo: e.target.value })} />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Protocolo de Procedimiento</label>
                <textarea className="input-field" style={{ height: '80px' }} value={form.protocol} onChange={e => setForm({ ...form, protocol: e.target.value })} />
            </div>
            <div className="form-group">
                <label className="form-label">Cambiar Estado</label>
                <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="INICIADO">Iniciado</option>
                    <option value="EN_SEGUIMIENTO">En Seguimiento</option>
                    <option value="FINALIZADO">Finalizado</option>
                </select>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
                {submitting ? 'Guardando...' : 'Guardar Gestión'}
            </button>
        </form>
    );
};

const ReportsView = ({ tickets, user }) => {
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [filteredTickets, setFilteredTickets] = useState([]);

    useEffect(() => {
        const filtered = tickets.filter(t => {
            const ticketDate = new Date(t.createdAt).toISOString().split('T')[0];
            return ticketDate >= startDate && ticketDate <= endDate;
        });
        setFilteredTickets(filtered);
    }, [startDate, endDate, tickets]);

    const totalCommission = filteredTickets.length * 70000;

    const generatePDF = () => {
        const doc = new jsPDF();
        const now = new Date().toLocaleString();

        doc.setFontSize(22);
        doc.text('Reporte de Gestión PQR-Crismor', 20, 30);

        doc.setFontSize(12);
        doc.text(`Generado por: ${user.username}`, 20, 50);
        doc.text(`Fecha del Reporte: ${now}`, 20, 60);
        doc.text(`Periodo: desde ${startDate} hasta ${endDate}`, 20, 70);

        doc.line(20, 75, 190, 75);

        doc.setFontSize(14);
        doc.text('Resumen del Periodo', 20, 90);
        doc.text(`Casos gestionados: ${filteredTickets.length}`, 30, 100);
        doc.text(`Valor total comisionado: $${totalCommission.toLocaleString()} COP`, 30, 110);

        doc.setFontSize(10);
        doc.text('Detalle de Casos:', 20, 130);
        filteredTickets.forEach((t, i) => {
            const y = 140 + (i * 10);
            if (y < 280) {
                doc.text(`${t.id} - ${t.patientName} (${t.city}) - ${new Date(t.createdAt).toLocaleDateString()}`, 25, y);
            }
        });

        doc.save(`Reporte_PQR_${user.username}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '2rem' }}>Generar Informe de Gestión</h3>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Desde</label>
                    <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Hasta</label>
                    <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={generatePDF}>
                    📥 Descargar Informe PDF
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ padding: '2rem', background: 'rgba(139, 115, 85, 0.05)', borderRadius: '15px' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Casos en el periodo</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{filteredTickets.length}</p>
                </div>
                <div style={{ padding: '2rem', background: 'rgba(139, 115, 85, 0.05)', borderRadius: '15px' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Comisionado</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-earth)' }}>
                        ${totalCommission.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

const ProfileView = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            const response = await fetch('http://127.0.0.1:3000/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                onUpdate(data);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) { alert('Error al actualizar perfil'); }
        finally { setLoading(false); }
    };

    return (
        <div className="glass-card" style={{ maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '2rem' }}>Información de Mi Perfil</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Nombre de Usuario</label>
                    <input className="input-field" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Correo Electrónico</label>
                    <input className="input-field" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Teléfono de Contacto</label>
                    <input className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">URL del Avatar (Imagen)</label>
                    <input className="input-field" value={formData.avatar} onChange={e => setFormData({ ...formData, avatar: e.target.value })} placeholder="https://ejemplo.com/foto.jpg" />
                </div>
                <div className="form-group">
                    <label className="form-label">Cambiar Contraseña (Dejar en blanco para mantener actual)</label>
                    <input className="input-field" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                    </button>
                    {success && <p style={{ color: 'var(--success)', fontWeight: '600' }}>✓ Perfil actualizado con éxito</p>}
                </div>
            </form>
        </div>
    );
};

const StatsView = ({ stats }) => {
    if (!stats) return <div className="loading-placeholder" style={{ height: '200px' }}></div>;
    return (
        <div>
            <h3 style={{ marginBottom: '2rem' }}>Resumen General de Gestión</h3>
            <div className="stats-grid">
                <StatCard label="Total PQRs" value={stats.totalTickets} color="var(--primary-earth)" />
                <StatCard label="Casos Finalizados" value={stats.resolvedTickets} color="var(--success)" />
                <StatCard label="Ingresos Totales" value={`$${stats.totalRevenue.toLocaleString()}`} color="#8B7355" />
            </div>

            <div className="glass-card">
                <h4>Distribución por Ciudad</h4>
                <div style={{ marginTop: '1.5rem' }}>
                    {stats.cityStats.map(c => (
                        <div key={c.city} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ fontWeight: '500' }}>{c.city}</span>
                            <span className="status-badge" style={{ background: 'var(--pale-green)', color: 'var(--text-dark)' }}>{c._count._all} casos</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card"
        style={{ textAlign: 'center', borderTop: `6px solid ${color}`, padding: '2.5rem 1rem' }}
    >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: color }}>{value}</p>
    </motion.div>
);

export default Dashboard;
