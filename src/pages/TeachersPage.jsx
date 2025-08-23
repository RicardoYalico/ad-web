import React, { useState, useEffect } from 'react';

// --- Iconos SVG ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;


// --- Datos de los Servicios y Especialistas ---
const services = [
    { id: 1, name: 'Consulta General', duration: 30, description: 'Revisión completa y diagnóstico.' },
    { id: 2, name: 'Limpieza Dental', duration: 60, description: 'Limpieza profunda y pulido.' },
    { id: 3, name: 'Blanqueamiento Dental', duration: 90, description: 'Tratamiento para aclarar el tono de los dientes.' },
    { id: 4, name: 'Ortodoncia', duration: 45, description: 'Consulta y ajuste de brackets.' },
];

const specialists = [
    { id: 1, name: 'Dr. Alejandro Rojas', profession: 'Odontólogo General', experience: '12 años de experiencia', specializations: ['Endodoncia', 'Odontología Estética'], bio: 'Apasionado por devolverle la sonrisa a mis pacientes con un enfoque en la prevención y el cuidado integral.', avatar: 'https://placehold.co/150x150/E2E8F0/4A5568?text=AR', serviceIds: [1, 2] },
    { id: 2, name: 'Dra. Sofía Castillo', profession: 'Ortodoncista', experience: '8 años de experiencia', specializations: ['Ortodoncia Invisible', 'Ortopedia Maxilar'], bio: 'Especialista en alinear sonrisas y mejorar la funcionalidad masticatoria con las técnicas más modernas.', avatar: 'https://placehold.co/150x150/E2E8F0/4A5568?text=SC', serviceIds: [3, 4] },
    { id: 3, name: 'Dr. Mateo Vargas', profession: 'Periodoncista', experience: '15 años de experiencia', specializations: ['Implantes Dentales', 'Cirugía Periodontal'], bio: 'Dedicado a la salud de las encías y a la reconstrucción ósea para garantizar la longevidad de tu sonrisa.', avatar: 'https://placehold.co/150x150/E2E8F0/4A5568?text=MV', serviceIds: [1, 4] },
    { id: 4, name: 'Dra. Valentina Morales', profession: 'Odontopediatra', experience: '10 años de experiencia', specializations: ['Odontología Preventiva', 'Manejo de Conducta'], bio: 'Mi misión es crear experiencias positivas para los más pequeños, asegurando su salud dental desde la infancia.', avatar: 'https://placehold.co/150x150/E2E8F0/4A5568?text=VM', serviceIds: [2, 3] },
];

// --- Componente de Barra de Progreso ---
const ProgressBar = ({ currentStep }) => {
    const steps = ['Servicio', 'Especialista', 'Fecha y Hora', 'Tus Datos', 'Confirmación'];
    return (
        <div className="mb-8">
            <div className="flex justify-between items-center">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber <= currentStep;
                    const isCurrent = stepNumber === currentStep;
                    return (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isActive ? 'bg-teal-500' : 'bg-gray-300'}`}>
                                    {stepNumber}
                                </div>
                                <p className={`mt-2 text-sm text-center ${isCurrent ? 'text-teal-600 font-bold' : 'text-gray-500'}`}>{step}</p>
                            </div>
                            {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 ${isActive ? 'bg-teal-500' : 'bg-gray-300'}`}></div>}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

// --- Componente Principal ---
const NewAppPage = () => {
    const [view, setView] = useState('booking');
    const [step, setStep] = useState(1);
    const [bookingDetails, setBookingDetails] = useState({
        service: null, specialist: null, date: '', time: '', patientName: '', reason: ''
    });
    const [allAppointments, setAllAppointments] = useState(() => {
        const saved = localStorage.getItem('allAppointments');
        return saved ? JSON.parse(saved) : [];
    });
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);

    useEffect(() => {
        localStorage.setItem('allAppointments', JSON.stringify(allAppointments));
    }, [allAppointments]);

    const handleNextStep = () => setStep(prev => prev + 1);
    const handlePrevStep = () => setStep(prev => prev - 1);

    const updateBookingDetails = (details) => {
        setBookingDetails(prev => ({ ...prev, ...details }));
    };

    const handleBookingConfirmation = () => {
        const newAppointment = { ...bookingDetails, id: Date.now() };
        setAllAppointments(prev => [...prev, newAppointment]);
        handleNextStep();
    };

    const handleCancelAppointment = () => {
        if (appointmentToCancel) {
            setAllAppointments(prev => prev.filter(app => app.id !== appointmentToCancel.id));
            setAppointmentToCancel(null);
        }
    };
    
    const resetBooking = () => {
        setBookingDetails({ service: null, specialist: null, date: '', time: '', patientName: '', reason: '' });
        setStep(1);
        setView('booking');
    };

    const renderBookingWizard = () => {
        switch (step) {
            case 1: return <Step1ServiceSelection onNext={handleNextStep} onSelectService={updateBookingDetails} />;
            case 2: return <Step2SpecialistSelection onNext={handleNextStep} onBack={handlePrevStep} onSelectSpecialist={updateBookingDetails} bookingDetails={bookingDetails} />;
            case 3: return <Step3DateTimeSelection onNext={handleNextStep} onBack={handlePrevStep} onSelectDateTime={updateBookingDetails} allAppointments={allAppointments} />;
            case 4: return <Step4UserDetails onNext={handleNextStep} onBack={handlePrevStep} onUpdateDetails={updateBookingDetails} bookingDetails={bookingDetails} />;
            case 5: return <Step5Confirmation onConfirm={handleBookingConfirmation} onBack={handlePrevStep} bookingDetails={bookingDetails} />;
            case 6: return <Step6Success bookingDetails={bookingDetails} onNewBooking={resetBooking} />;
            default: return <div>Paso no encontrado</div>;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-center gap-4 mb-8 border-b pb-4">
                    <button onClick={() => setView('booking')} className={`font-bold py-2 px-4 rounded-lg ${view === 'booking' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Reservar Cita</button>
                    <button onClick={() => setView('list')} className={`font-bold py-2 px-4 rounded-lg ${view === 'list' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Mis Citas</button>
                </div>

                {view === 'booking' && (
                    <>
                        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Reserva tu Cita</h1>
                        <p className="text-center text-gray-500 mb-8">Sigue los pasos para agendar tu próxima visita.</p>
                        {step < 6 && <ProgressBar currentStep={step} />}
                        {renderBookingWizard()}
                    </>
                )}

                {view === 'list' && (
                    <MyAppointmentsView appointments={allAppointments} onCancelClick={setAppointmentToCancel} />
                )}
            </div>

            {appointmentToCancel && (
                <CancelModal 
                    appointment={appointmentToCancel} 
                    onConfirm={handleCancelAppointment} 
                    onClose={() => setAppointmentToCancel(null)} 
                />
            )}
        </div>
    );
};

// --- VISTA DE MIS CITAS ---
const MyAppointmentsView = ({ appointments, onCancelClick }) => {
    const now = new Date();
    const upcomingAppointments = appointments
        .filter(app => new Date(`${app.date}T${app.time}`) >= now)
        .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    const pastAppointments = appointments
        .filter(app => new Date(`${app.date}T${app.time}`) < now)
        .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

    return (
        <div>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Mis Citas</h1>
            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Próximas Citas</h2>
                    {upcomingAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingAppointments.map(app => (
                                <div key={app.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{app.service?.name || 'Servicio no especificado'}</p>
                                        <p className="text-sm text-gray-600">{app.date} a las {app.time}</p>
                                        <p className="text-sm text-gray-500">con {app.specialist?.name || 'Especialista no especificado'}</p>
                                    </div>
                                    <button onClick={() => onCancelClick(app)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No tienes citas próximas.</p>
                    )}
                </section>
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Historial de Citas</h2>
                    {pastAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {pastAppointments.map(app => (
                                <div key={app.id} className="bg-gray-50 p-4 rounded-lg opacity-70">
                                    <p className="font-bold text-gray-600">{app.service?.name || 'Servicio no especificado'}</p>
                                    <p className="text-sm text-gray-500">{app.date} a las {app.time}</p>
                                     <p className="text-sm text-gray-500">con {app.specialist?.name || 'Especialista no especificado'}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No tienes citas en tu historial.</p>
                    )}
                </section>
            </div>
        </div>
    );
};


// --- MODAL DE CANCELACIÓN ---
const CancelModal = ({ appointment, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">¿Estás seguro?</h2>
            <p className="text-gray-600 mb-6">
                Estás a punto de cancelar tu cita para <strong className="font-semibold">{appointment.service?.name || 'un servicio'}</strong> el día {appointment.date}. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">No, mantener</button>
                <button onClick={onConfirm} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600">Sí, cancelar</button>
            </div>
        </div>
    </div>
);


// --- Componentes de Pasos ---
const Step1ServiceSelection = ({ onNext, onSelectService }) => {
    const handleSelect = (service) => {
        onSelectService({ service });
        onNext();
    };
    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-center">1. Selecciona un servicio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => (
                    <button key={service.id} onClick={() => handleSelect(service)} className="text-left p-4 border rounded-lg hover:bg-teal-50 hover:border-teal-500 transition-all">
                        <h3 className="font-bold text-lg text-gray-800">{service.name}</h3>
                        <p className="text-gray-600">{service.description}</p>
                        <p className="text-sm text-teal-600 font-semibold mt-2">{service.duration} minutos</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const SpecialistDetailModal = ({ specialist, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                <div className="flex flex-col sm:flex-row gap-6">
                    <img src={specialist.avatar} alt={specialist.name} className="w-32 h-32 rounded-full object-cover mx-auto sm:mx-0" />
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-800">{specialist.name}</h2>
                        <p className="text-teal-600 font-semibold">{specialist.profession}</p>
                        <p className="text-sm text-gray-500">{specialist.experience}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="font-bold text-gray-700">Especializaciones</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {specialist.specializations.map(spec => (
                            <span key={spec} className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{spec}</span>
                        ))}
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="font-bold text-gray-700">Sobre mí</h3>
                    <p className="text-gray-600 mt-2 text-sm">{specialist.bio}</p>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg">Cerrar</button>
                    <button onClick={() => onSelect(specialist)} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg">Seleccionar</button>
                </div>
            </div>
        </div>
    );
};

const Step2SpecialistSelection = ({ onNext, onBack, onSelectSpecialist, bookingDetails }) => {
    const [modalSpecialist, setModalSpecialist] = useState(null);
    const availableSpecialists = specialists.filter(s => s.serviceIds.includes(bookingDetails.service.id));

    const handleSelect = (specialist) => {
        onSelectSpecialist({ specialist });
        setModalSpecialist(null);
        onNext();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-center">2. Elige un especialista</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSpecialists.map(specialist => (
                    <div key={specialist.id} className="p-4 border rounded-lg text-center">
                        <img src={specialist.avatar} alt={specialist.name} className="w-24 h-24 rounded-full object-cover mx-auto" />
                        <h3 className="font-bold text-lg text-gray-800 mt-4">{specialist.name}</h3>
                        <p className="text-sm text-gray-500">{specialist.profession}</p>
                        <button onClick={() => setModalSpecialist(specialist)} className="mt-4 text-teal-600 font-semibold text-sm">Ver Perfil</button>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg">Atrás</button>
            </div>

            {modalSpecialist && (
                <SpecialistDetailModal 
                    specialist={modalSpecialist}
                    onSelect={handleSelect}
                    onClose={() => setModalSpecialist(null)}
                />
            )}
        </div>
    );
};

const Step3DateTimeSelection = ({ onNext, onBack, onSelectDateTime, allAppointments }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    
    const availableTimes = () => {
        if (!date) return [];
        const workHours = [];
        for (let i = 9; i <= 17; i++) {
            workHours.push(`${String(i).padStart(2, '0')}:00`);
            workHours.push(`${String(i).padStart(2, '0')}:30`);
        }
        const bookedTimes = allAppointments.filter(app => app.date === date).map(app => app.time);
        return workHours.filter(t => !bookedTimes.includes(t));
    };

    const handleNext = () => {
        onSelectDateTime({ date, time });
        onNext();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-center">3. Elige fecha y hora</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label htmlFor="date" className="block text-gray-700 font-semibold mb-2">Fecha</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-lg" min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                    <h3 className="text-gray-700 font-semibold mb-2">Horarios Disponibles</h3>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {availableTimes().map(t => (
                            <button key={t} onClick={() => setTime(t)} className={`p-2 rounded-lg border ${time === t ? 'bg-teal-500 text-white' : 'hover:bg-gray-100'}`}>
                                {t}
                            </button>
                        ))}
                        {date && availableTimes().length === 0 && <p className="col-span-3 text-gray-500">No hay horarios disponibles.</p>}
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg">Atrás</button>
                <button onClick={handleNext} disabled={!date || !time} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-300">Siguiente</button>
            </div>
        </div>
    );
};

const Step4UserDetails = ({ onNext, onBack, onUpdateDetails, bookingDetails }) => {
    const [formData, setFormData] = useState({
        patientName: bookingDetails.patientName || '',
        reason: bookingDetails.reason || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        onUpdateDetails(formData);
        onNext();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-center">4. Ingresa tus datos</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="patientName" className="block text-gray-700 font-semibold mb-2">Nombre Completo</label>
                    <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Ej: Ana Sofía Rodríguez" />
                </div>
                <div>
                    <label htmlFor="reason" className="block text-gray-700 font-semibold mb-2">Motivo de la consulta (opcional)</label>
                    <textarea name="reason" rows="3" value={formData.reason} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Ej: Dolor en una muela"></textarea>
                </div>
            </div>
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg">Atrás</button>
                <button onClick={handleNext} disabled={!formData.patientName} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-300">Siguiente</button>
            </div>
        </div>
    );
};

const Step5Confirmation = ({ onConfirm, onBack, bookingDetails }) => {
    const { service, specialist, date, time, patientName } = bookingDetails;
    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-center">5. Confirma tu cita</h2>
            <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Resumen de la Cita</h3>
                <div className="space-y-2">
                    <p><strong className="text-gray-600">Paciente:</strong> {patientName}</p>
                    <p><strong className="text-gray-600">Servicio:</strong> {service.name}</p>
                    <p><strong className="text-gray-600">Especialista:</strong> {specialist.name}</p>
                    <p><strong className="text-gray-600">Fecha:</strong> {date}</p>
                    <p><strong className="text-gray-600">Hora:</strong> {time}</p>
                </div>
            </div>
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg">Atrás</button>
                <button onClick={onConfirm} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg">Confirmar Cita</button>
            </div>
        </div>
    );
};

const Step6Success = ({ bookingDetails, onNewBooking }) => {
    return (
        <div className="text-center">
            <CheckCircleIcon />
            <h2 className="text-2xl font-bold mt-4 text-gray-800">¡Cita Agendada con Éxito!</h2>
            <p className="text-gray-600 mt-2">Hemos confirmado tu cita para el servicio de <strong className="text-gray-700">{bookingDetails.service.name}</strong>.</p>
            <div className="bg-gray-50 p-4 rounded-lg border mt-6 text-left">
                <p><strong className="text-gray-600">Paciente:</strong> {bookingDetails.patientName}</p>
                <p><strong className="text-gray-600">Especialista:</strong> {bookingDetails.specialist.name}</p>
                <p><strong className="text-gray-600">Fecha:</strong> {bookingDetails.date} a las {bookingDetails.time}</p>
            </div>
            <button onClick={onNewBooking} className="mt-8 bg-teal-500 text-white font-bold py-3 px-8 rounded-lg">Agendar otra cita</button>
        </div>
    );
};

export default NewAppPage;
