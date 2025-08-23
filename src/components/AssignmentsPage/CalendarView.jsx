import React, { useState, useEffect, useMemo } from 'react';
import { Mail, BookOpen, Calendar, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle, UserCheck, MapPin } from 'lucide-react';

// --- CORREGIDO: Convertido de Hook a función auxiliar ---
const getStatusStyles = (status) => {
    switch (status) {
        case 'NUEVO':
            return {
                background: 'bg-green-50',
                border: 'border-l-4 border-green-400',
                highlight: 'bg-green-100 border-green-500 text-green-900 hover:bg-green-200',
            };
        case 'MODIFICADO':
            return {
                background: 'bg-yellow-50',
                border: 'border-l-4 border-yellow-400',
                highlight: 'bg-yellow-100 border-yellow-500 text-yellow-900 hover:bg-yellow-200',
            };
        default:
            return {
                background: 'bg-white',
                border: 'border-l-4 border-transparent',
                highlight: 'bg-blue-100 border-blue-500 text-blue-900 hover:bg-blue-200',
            };
    }
};

const CalendarView = ({ courses, pidd, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const dayNameToNumber = (name) => {
        if (!name) return -1;
        const lowerName = name.toLowerCase();
        const map = { 'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6 };
        for (const key in map) {
            if (lowerName.includes(key)) return map[key];
        }
        return -1;
    };

    const getFormattedDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const scheduledEvents = useMemo(() => {
        const events = {};
        if (!courses) return events;
        courses.forEach(course => {
            course.horarios?.forEach(horario => {
                if (!horario.fechaInicio || !horario.fechaFin) return;

                const startDate = new Date(horario.fechaInicio);
                const endDate = new Date(horario.fechaFin);
                const dayIndex = dayNameToNumber(horario.dia);

                if (dayIndex === -1) return;

                let currentDateInLoop = new Date(startDate);
                while (currentDateInLoop <= endDate) {
                    if (currentDateInLoop.getDay() === dayIndex) {
                        const dateKey = getFormattedDateKey(currentDateInLoop);
                        if (!events[dateKey]) events[dateKey] = [];
                        const isPiddCourse = pidd?.codCurso === course.codCurso;

                        const eventStatus = horario.estadoHistorico || course.estadoHistorico;

                        events[dateKey].push({
                            name: course.nombreCurso,
                            code: course.codCurso,
                            section: course.seccion,
                            nrc: course.nrc,
                            periodo: course.periodo,
                            metEdu: course.metEdu,
                            time: horario.hora,
                            campus: horario.campus,
                            aula: horario.aula,
                            fechaInicio: horario.fechaInicio,
                            fechaFin: horario.fechaFin,
                            isPidd: isPiddCourse,
                            esaCurso: isPiddCourse ? pidd.esaCurso : null,
                            estadoHistorico: eventStatus
                        });
                    }
                    currentDateInLoop.setDate(currentDateInLoop.getDate() + 1);
                }
            });
        });
        return events;
    }, [courses, pidd]);

    const changeWeek = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (offset * 7));
            return newDate;
        });
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const weekDayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    const timeStringToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const cleanedTime = timeStr.replace(/\s/g, '').replace(":", "");
        if (cleanedTime.length < 4) return 0;
        const hours = parseInt(cleanedTime.substring(0, 2), 10);
        const minutes = parseInt(cleanedTime.substring(2, 4), 10);
        return hours * 60 + minutes;
    };

    const EventCard = ({ event, onClick }) => {
        const styles = getStatusStyles(event.estadoHistorico);

        if (!event.time) return null;
        const [start, end] = event.time.split('-').map(t => t.trim());
        if (!start || !end) return null;

        const startMinutes = timeStringToMinutes(start);
        const endMinutes = timeStringToMinutes(end);
        if (isNaN(startMinutes) || isNaN(endMinutes)) return null;

        const top = ((startMinutes - (7 * 60)) / 60) * 5;
        const height = ((endMinutes - startMinutes) / 60) * 5;

        return (
            <button
                onClick={() => onClick(event)}
                className={`absolute w-[96%] left-[2%] p-2 text-left text-xs rounded-lg shadow-md overflow-hidden transition-colors ${event.isPidd ? 'bg-amber-100 border-l-4 border-amber-500 text-amber-900 hover:bg-amber-200' : styles.highlight}`}
                style={{ top: `${top}rem`, height: `${height}rem`, zIndex: 10 }}
            >
                <p className="font-bold truncate">{event.name}</p>
                <p className="font-semibold truncate">NRC: {event.nrc}</p>
                <p className="truncate">Cód: {event.code}</p>
                <p className="truncate">Mod: {event.metEdu ? `${event.metEdu.charAt(0)}.` : ''} ({event.time})</p>
                {event.estadoHistorico && <StatusBadge status={event.estadoHistorico} />}
            </button>
        );
    };

    const renderWeeklyView = () => {
        const timeSlots = Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1));

        return (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex">
                    <div className="w-20 text-right text-xs text-gray-500 flex-shrink-0">
                        <div className="h-20 border-r border-b"></div>
                        {timeSlots.map(time => <div key={time} className="h-20 pr-2 border-r border-t flex justify-end items-start pt-1">{time}</div>)}
                    </div>
                    <div className="flex-1 grid grid-cols-7">
                        {weekDayNames.map((dayName, index) => {
                            const currentColumnDate = new Date(startOfWeek);
                            currentColumnDate.setDate(startOfWeek.getDate() + index);
                            const dateKey = getFormattedDateKey(currentColumnDate);
                            const eventsForDay = scheduledEvents[dateKey] || [];
                            return (
                                <div key={index} className="border-r relative">
                                    <div className="text-center p-2 border-b-2 h-20 flex flex-col justify-center">
                                        <span className="font-semibold text-gray-500 text-sm">{dayName}</span>
                                        <span className="text-3xl font-light mt-1">{currentColumnDate.getDate()}</span>
                                    </div>
                                    <div className="relative h-full">
                                        {timeSlots.map((_, i) => <div key={i} className="h-20 border-t"></div>)}
                                        <div className="absolute inset-0 p-1">
                                            {eventsForDay.map((event, eventIndex) => (
                                                <EventCard key={eventIndex} event={event} onClick={onEventClick} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                    <h3 className="text-xl font-bold mx-4">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
                </div>
                <p className="text-sm text-gray-600">Vista Semanal</p>
            </div>
            {renderWeeklyView()}
        </div>
    );
};

export default CalendarView;