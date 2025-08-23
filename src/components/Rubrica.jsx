import React, { useState, useMemo, useEffect } from 'react';

// We'll use the SheetJS library for XLSX export.
// A script tag should be added to the main HTML file to load it.
// <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>

// --- MOCK API FUNCTIONS ---
// These functions simulate fetching data from a backend API.
// In a real application, you would replace these with actual `fetch` calls.
// The template is now passed as a prop, so fetchTemplateFromAPI is removed.

/**
 * Simulates fetching the list of teachers.
 */
const fetchTeachersFromAPI = async () => {
    console.log("Fetching teachers from API...");
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: '1', name: 'PIZARRO/SALAS, DENISS DIANA', bannerId: 'N00123456' },
        { id: '2', name: 'GARCIA/LOPEZ, CARLOS ALBERTO', bannerId: 'N00234567' },
        { id: '3', name: 'MARTINEZ/RODRIGUEZ, ANA SOFIA', bannerId: 'N00345678' },
        { id: '4', name: 'TORRES/DIAZ, JAVIER FERNANDO', bannerId: 'N00456789' },
        // Note: The teacher from temp data is NOT initially here to test the dynamic addition.
    ];
};

/**
 * Simulates fetching course data.
 */
const fetchCoursesFromAPI = async () => {
    console.log("Fetching courses from API...");
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
        'CS101': 'Introducción a la Programación',
        'MA202': 'Cálculo Avanzado',
        'HI303': 'Historia del Arte Moderno',
        'PY404': 'Psicología Organizacional',
        // Note: The course from temp data is NOT initially here.
    };
};

/**
 * [MODIFIED] Fetches and processes the list of unique specialists from the new API endpoint.
 */
const fetchSpecialistsFromAPI = async () => {
    console.log("Fetching specialists from API...");
    try {
        const response = await fetch('http://localhost:3001/api/disponibilidad-acompaniamiento');
        if (!response.ok) {
            throw new Error('Network response for specialists was not ok');
        }
        const data = await response.json();

        // Process the data to get a unique list of names
        const specialistNames = data.map(item => item.apellidosNombresCompletos);
        const uniqueSpecialistNames = [...new Set(specialistNames)];
        console.log("Unique specialists found:", uniqueSpecialistNames);
        return uniqueSpecialistNames;
    } catch (error) {
        console.error("Failed to fetch specialists:", error);
        // Fallback to mock data if API fails
        return ["ABANTO GALVEZ ANA MARLENE", "MIRANDA GARCÍA CARMEN DOLORES"];
    }
};


/**
 * [MODIFIED] Simulates fetching all dropdown options for the form, *except* for specialists.
 */
const fetchFormOptionsFromAPI = async () => {
    console.log("Fetching form options from API...");
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
        // specialists list is now fetched separately.
        programs: ['WA', 'UG'],
        segments: ['Docente Nuevo', 'Docente < 10%', 'Docente 10% - 30%', 'Docente > 30%'],
        careers: ['Ingeniería de Software', 'Psicología', 'Administración de Empresas', 'Diseño Gráfico'],
        faculties: ['Ingeniería y Tecnología', 'Ciencias de la Salud', 'Negocios', 'Comunicaciones'],
        sedes: ['Lima Centro', 'Lima Norte', 'Arequipa', 'Trujillo'],
        observationNumbers: [1, 2, 3, 4],
        feedbackTypes: ['PRESENCIAL', 'SÍNCRONA', 'GRABADA'],
    };
};


// --- HELPER & UI COMPONENTS (No changes needed here unless specified) ---

const FormInput = ({ label, name, value, onChange, readOnly = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'}`}
        />
    </div>
);

const SelectInput = ({ label, name, value, onChange, options }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
            <option value="">Seleccione...</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

// SearchableSelect for objects with {id, name}
const SearchableSelect = ({ label, value, onChange, options, resetKey }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    
    useEffect(() => {
        setSearchTerm(value?.name || "");
    }, [value]);

    useEffect(() => {
        if (resetKey > 0) {
            setSearchTerm(value?.name || "");
        }
    }, [resetKey, value]);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option);
        setSearchTerm(option.name);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isOpen) setIsOpen(true);
                     if (e.target.value === '') onChange(null);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Buscar docente..."
            />
            {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <li
                                key={opt.id}
                                onClick={() => handleSelect(opt)}
                                className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                            >
                                {opt.name}
                            </li>
                        ))
                    ) : (
                        <li className="px-3 py-2 text-gray-500">No se encontraron resultados</li>
                    )}
                </ul>
            )}
        </div>
    );
};

// [NEW] SearchableStringSelect for simple string arrays
const SearchableStringSelect = ({ label, name, value, onChange, options, resetKey }) => {
    const [searchTerm, setSearchTerm] = useState(value || "");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setSearchTerm(value || "");
    }, [value]);

    useEffect(() => {
        if (resetKey > 0) {
            setSearchTerm(value || "");
        }
    }, [resetKey, value]);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange({ target: { name, value: option } });
        setSearchTerm(option);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isOpen) setIsOpen(true);
                    if (e.target.value === '') {
                        onChange({ target: { name, value: '' } });
                    }
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={`Buscar ${label.toLowerCase()}...`}
            />
            {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <li
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                            >
                                {opt}
                            </li>
                        ))
                    ) : (
                        <li className="px-3 py-2 text-gray-500">No se encontraron resultados</li>
                    )}
                </ul>
            )}
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
        <div className="w-20 h-20 border-8 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="ml-4 text-xl text-gray-700">Cargando datos...</p>
    </div>
);

const Notification = ({ message, type, onDismiss }) => {
    const baseClasses = "fixed top-5 right-5 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down";
    const typeClasses = {
        success: "bg-green-500",
        error: "bg-red-500",
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 5000); // Dismiss after 5 seconds
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {message}
        </div>
    );
};

/**
 * NEW: StatusModal Component
 * A modal to show loading, success, or error states, inspired by SweetAlert.
 */
const StatusModal = ({ status, message, onSuccess, onClose }) => {
    if (!status) return null;

    const modalContent = {
        saving: {
            icon: <div className="w-16 h-16 border-8 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>,
            title: "Guardando Rúbrica...",
            text: "Por favor, espere un momento.",
            button: null,
        },
        success: {
            icon: (
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            ),
            title: "¡Éxito!",
            text: message,
            button: <button onClick={onSuccess} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700">Aceptar</button>,
        },
        error: {
            icon: (
                 <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            ),
            title: "¡Error!",
            text: message,
            button: <button onClick={onClose} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700">Cerrar</button>,
        },
    };

    const current = modalContent[status];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center flex flex-col items-center w-full max-w-sm m-4">
                {current.icon}
                <h2 className="text-2xl font-bold mt-5 text-gray-800">{current.title}</h2>
                <p className="text-gray-600 mt-2 mb-6">{current.text}</p>
                {current.button}
            </div>
        </div>
    );
};


const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Handles ISO strings (e.g., "2025-07-20T00:00:00.000Z") and returns "YYYY-MM-DD"
    return new Date(dateString).toISOString().slice(0, 10);
};

// --- INITIAL STATE DEFINITIONS ---
const initialTeacherInfo = {
    docente: null,
    idBanner: '',
    nrcCurso: '',
    nombreCurso: '',
    programa: '',
    segmentoDocente: '',
    especialista: '',
    fechaObs: new Date().toISOString().slice(0, 10),
    carrera: '',
    facultad: '',
    sede: '',
    nObservacion: '1',
};

const initialReportExtras = {
    feedbackType: 'SÍNCRONA',
    feedbackDate: '',
    agreements: '',
    feedbackComments: '',
};


// --- MAIN COMPONENT ---
const Rubrica = ({ onCancel, initialData = null, rubricTemplate = null, tempTeacherData = null, tempCursoData = null, tempHorarioData = null }) => {
    // --- STATE MANAGEMENT ---
    // State for dynamic data fetched from API
    const [apiTeacherOptions, setApiTeacherOptions] = useState([]);
    const [apiCourseOptions, setApiCourseOptions] = useState({});
    const [apiFormOptions, setApiFormOptions] = useState({
        specialists: [], programs: [], segments: [], careers: [],
        faculties: [], sedes: [], observationNumbers: [], feedbackTypes: []
    });
        
    // State for component logic and user input
    const [view, setView] = useState('form');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summaryView, setSummaryView] = useState(false);
    const [teacherInfo, setTeacherInfo] = useState(initialTeacherInfo);
    const [rubricData, setRubricData] = useState([]);
    const [reportExtras, setReportExtras] = useState(initialReportExtras);
    const [competencyResults, setCompetencyResults] = useState([]);
    const [notification, setNotification] = useState(null);
    const [formResetKey, setFormResetKey] = useState(0);
    const [saveStatus, setSaveStatus] = useState(null);
    const [saveMessage, setSaveMessage] = useState('');

    // --- [MODIFIED] DERIVED STATE FOR UI OPTIONS ---
    // These memos will combine API data with temporary/initial data to create the final lists for dropdowns.
    const finalTeacherOptions = useMemo(() => {
        let options = [...apiTeacherOptions];
        
        // Handle initialData (edit mode)
        if (initialData?.teacherInfo) {
            const teacherExists = options.some(t => t.id === initialData.teacherInfo.teacherId);
            if (!teacherExists) {
                options.push({ id: initialData.teacherInfo.teacherId, name: initialData.teacherInfo.teacherName, bannerId: initialData.teacherInfo.teacherBannerId });
            }
        } 
        // Handle tempTeacherData (pre-fill mode)
        else if (tempTeacherData) {
            const teacherExists = options.some(t => t.id === tempTeacherData.idDocente);
            if (!teacherExists) {
                options.push({ id: tempTeacherData.idDocente, name: tempTeacherData.docente, bannerId: tempTeacherData.idDocente });
            }
        }
        return options;
    }, [apiTeacherOptions, tempTeacherData, initialData]);

    const finalCourseOptions = useMemo(() => {
        let options = { ...apiCourseOptions };

        // Handle initialData (edit mode)
        if (initialData?.teacherInfo && !options[initialData.teacherInfo.nrc]) {
            options[initialData.teacherInfo.nrc] = initialData.teacherInfo.courseName;
        }
        // Handle tempCursoData (pre-fill mode)
        else if (tempCursoData && !options[tempCursoData.nrc]) {
            options[tempCursoData.nrc] = tempCursoData.nombreCurso;
        }
        return options;
    }, [apiCourseOptions, tempCursoData, initialData]);

    const finalFormOptions = useMemo(() => {
        let newOptions = JSON.parse(JSON.stringify(apiFormOptions)); // Deep copy to avoid mutation
        
        const source = initialData?.teacherInfo || tempTeacherData;
        const horarioSource = initialData?.teacherInfo || tempHorarioData;

        if (source) {
            const specialist = source.specialistName || source.nombreEspecialista;
            if (specialist && !newOptions.specialists.includes(specialist)) {
                newOptions.specialists.push(specialist);
            }
            if (source.program && !newOptions.programs.includes(source.program)) {
                newOptions.programs.push(source.program);
            }
        }
        if (horarioSource) {
            const campus = horarioSource.campus || horarioSource.sede;
             if (campus && !newOptions.sedes.includes(campus)) {
                newOptions.sedes.push(campus);
            }
        }
        
        return newOptions;
    }, [apiFormOptions, tempTeacherData, tempHorarioData, initialData]);


    // --- [MODIFIED] DATA FETCHING EFFECT ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [teachers, courses, specialists, otherOptions] = await Promise.all([
                    fetchTeachersFromAPI(),
                    fetchCoursesFromAPI(),
                    fetchSpecialistsFromAPI(), // New API call for specialists
                    fetchFormOptionsFromAPI()
                ]);
                setApiTeacherOptions(teachers);
                setApiCourseOptions(courses);
                setApiFormOptions({ ...otherOptions, specialists: specialists }); // Combine results
            } catch (err) {
                setError('Error al cargar los datos del formulario. Por favor, recargue la página.');
                console.error("API Fetch Error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // --- FORM POPULATION & RESET LOGIC ---
    useEffect(() => {
        if (isLoading || !rubricTemplate) return;

        const initializeRubricState = () => {
            const newInitialRubric = rubricTemplate.structure.map(() => ({
                level: rubricTemplate.evaluationLevels[0] || 'NO SE OBSERVÓ',
                comment: ''
            }));
            setRubricData(newInitialRubric);
            setReportExtras(initialReportExtras);
            setCompetencyResults([]);
            setView('form');
        };

        if (initialData) {
            const { teacherInfo: initialTeacher, rubricDetails, reportSummary } = initialData;
            const foundTeacher = finalTeacherOptions.find(t => t.id === initialTeacher.teacherId) || null;
            
            setTeacherInfo({
                docente: foundTeacher,
                idBanner: initialTeacher.teacherBannerId,
                nrcCurso: initialTeacher.nrc,
                nombreCurso: initialTeacher.courseName,
                programa: initialTeacher.program,
                segmentoDocente: initialTeacher.teacherSegment,
                especialista: initialTeacher.specialistName,
                fechaObs: formatDateForInput(initialTeacher.observationDate),
                carrera: initialTeacher.career,
                facultad: initialTeacher.faculty,
                sede: initialTeacher.campus,
                nObservacion: initialTeacher.observationNumber.toString(),
            });

            if (rubricDetails) setRubricData(rubricDetails.map(d => ({ level: d.level, comment: d.comment })));
            if (reportSummary) {
                setReportExtras({
                    feedbackType: reportSummary.feedbackType,
                    feedbackDate: formatDateForInput(reportSummary.feedbackDate),
                    agreements: reportSummary.agreements,
                    feedbackComments: reportSummary.feedbackComments,
                });
                setCompetencyResults(reportSummary.competencies || []);
            }
        } else if (tempTeacherData) {
            const prefillInfo = { ...initialTeacherInfo };
            const foundTeacher = finalTeacherOptions.find(t => t.id === tempTeacherData.idDocente);

            prefillInfo.docente = foundTeacher;
            prefillInfo.idBanner = tempTeacherData.idDocente || '';
            prefillInfo.programa = tempTeacherData.programa || '';
            prefillInfo.especialista = tempTeacherData.nombreEspecialista || '';

            if (tempCursoData) {
                prefillInfo.nrcCurso = tempCursoData.nrc || '';
                prefillInfo.nombreCurso = tempCursoData.nombreCurso || '';
            }
            if (tempHorarioData) {
                prefillInfo.sede = tempHorarioData.campus || '';
            }

            setTeacherInfo(prefillInfo);
            initializeRubricState();
            setFormResetKey(prevKey => prevKey + 1);
        } else {
            setTeacherInfo(initialTeacherInfo);
            initializeRubricState();
            setFormResetKey(prevKey => prevKey + 1);
        }
    }, [initialData, rubricTemplate, tempTeacherData, tempCursoData, tempHorarioData, isLoading, finalTeacherOptions]);


    // --- DERIVED STATE & MEMOS ---
    const processedRubric = useMemo(() => {
        if (!rubricTemplate) return [];
        let lastMoment = null;
        let lastCriterion = null;
        return rubricTemplate.structure.map(row => {
            const showMoment = row.moment !== lastMoment;
            const showCriterion = row.criterion !== lastCriterion || showMoment;
            lastMoment = row.moment;
            lastCriterion = row.criterion;
            return { ...row, showMoment, showCriterion };
        });
    }, [rubricTemplate]);

    // --- OTHER EFFECTS ---
    useEffect(() => {
        if (teacherInfo.docente && !tempTeacherData && !initialData) {
            setTeacherInfo(prev => ({ ...prev, idBanner: prev.docente.bannerId || '' }));
        }
    }, [teacherInfo.docente, tempTeacherData, initialData]);

    useEffect(() => {
        if (!tempCursoData && !initialData && teacherInfo.nrcCurso) {
            const courseName = finalCourseOptions[teacherInfo.nrcCurso] || '';
            setTeacherInfo(prev => ({ ...prev, nombreCurso: courseName }));
        }
    }, [teacherInfo.nrcCurso, finalCourseOptions, tempCursoData, initialData]);

    // --- HANDLER FUNCTIONS ---
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setTeacherInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleTeacherSelect = (teacher) => {
        setTeacherInfo(prev => ({ ...prev, docente: teacher }));
    };
    
    const handleRubricChange = (index, field, value) => {
        const newData = [...rubricData];
        newData[index][field] = value;
        setRubricData(newData);
    };
    
    const handleReportExtrasChange = (e) => {
        const { name, value } = e.target;
        setReportExtras(prev => ({ ...prev, [name]: value }));
    };

    const handleReportTextChange = (index, field, value) => {
        const newResults = [...competencyResults];
        newResults[index][field] = value;
        setCompetencyResults(newResults);
    };
    
    const handleBulkMark = (level) => {
        setRubricData(rubricData.map(item => ({ ...item, level: level })));
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
    };
    
    // --- LOGIC FOR REPORT & EXPORT ---
    const generateReport = () => {
        if (!rubricTemplate) return;
        const results = {};
        Object.keys(rubricTemplate.competencies).forEach(comp => {
            results[comp] = { levels: [] };
        });
        rubricData.forEach((data, index) => {
            if (data.level) {
                const associatedCompetencies = rubricTemplate.structure[index].competency.split(',').map(c => c.trim().toUpperCase());
                associatedCompetencies.forEach(compKey => {
                    const matchedKey = Object.keys(rubricTemplate.competencies).find(k => k.toUpperCase() === compKey);
                    if (matchedKey && results[matchedKey]) {
                        results[matchedKey].levels.push(data.level);
                    }
                });
            }
        });
        const finalResults = Object.keys(results).map(comp => {
            const { levels } = results[comp];
            let achievedLevel = 'Ausente';
            if (levels.length > 0) {
                const validLevels = levels.filter(l => l !== "NO SE OBSERVÓ");
                if (validLevels.length > 0) {
                    const minLevelValue = Math.min(...validLevels.map(l => rubricTemplate.levelOrder[l]));
                    achievedLevel = Object.keys(rubricTemplate.levelOrder).find(key => rubricTemplate.levelOrder[key] === minLevelValue);
                } else {
                    achievedLevel = 'NO SE OBSERVÓ';
                }
            }
            const existingResult = competencyResults.find(c => c.name === comp);
            return {
                name: comp,
                description: rubricTemplate.competencies[comp],
                achievedLevel,
                fortalezas: existingResult ? existingResult.fortalezas : '',
                mejoras: existingResult ? existingResult.mejoras : ''
            };
        });
        setCompetencyResults(finalResults);
        setView('report');
    };

    const handleSaveOrUpdateData = async () => {
        if (!teacherInfo.docente || !teacherInfo.especialista || !teacherInfo.nrcCurso) {
            setSaveMessage("Por favor, complete todos los campos obligatorios (Docente, Especialista, NRC).");
            setSaveStatus('error');
            return;
        }
        if (!rubricTemplate) {
            setSaveMessage("Error: No se ha cargado la plantilla de la rúbrica.");
            setSaveStatus('error');
            return;
        }
        setSaveStatus('saving');
        const payload = {
            templateInfo: {
                templateId: rubricTemplate._id,
                name: rubricTemplate.name,
                version: rubricTemplate.version
            },
            teacherInfo: {
                teacherId: teacherInfo.docente.id,
                teacherName: teacherInfo.docente.name,
                teacherBannerId: teacherInfo.idBanner,
                nrc: teacherInfo.nrcCurso,
                courseName: teacherInfo.nombreCurso,
                program: teacherInfo.programa,
                teacherSegment: teacherInfo.segmentoDocente,
                specialistName: teacherInfo.especialista,
                observationDate: teacherInfo.fechaObs,
                career: teacherInfo.carrera,
                faculty: teacherInfo.facultad,
                campus: teacherInfo.sede,
                observationNumber: parseInt(teacherInfo.nObservacion, 10)
            },
            rubricDetails: rubricTemplate.structure.map((item, index) => ({
                ...item,
                level: rubricData[index].level,
                comment: rubricData[index].comment,
            })),
            reportSummary: {
                competencies: competencyResults.map(comp => ({
                    name: comp.name,
                    description: comp.description,
                    achievedLevel: comp.achievedLevel,
                    fortalezas: comp.fortalezas,
                    mejoras: comp.mejoras,
                })),
                feedbackType: reportExtras.feedbackType,
                feedbackDate: reportExtras.feedbackDate || null,
                agreements: reportExtras.agreements,
                feedbackComments: reportExtras.feedbackComments,
            }
        };
        const isUpdating = initialData && initialData._id;
        const url = isUpdating ? `http://localhost:3002/api/rubricas/${initialData._id}` : 'http://localhost:3002/api/rubricas/';
        const method = isUpdating ? 'PUT' : 'POST';
        console.log(`Sending payload to API (${method}):`, JSON.stringify(payload, null, 2));
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            setSaveMessage(isUpdating ? "Rúbrica actualizada con éxito." : "Rúbrica guardada con éxito.");
            setSaveStatus('success');
        } catch (error) {
            console.error("Error saving data:", error);
            setSaveMessage(`Error al guardar: ${error.message}. Simulación fallida.`);
            setSaveStatus('error');
        }
    };
    
    const handleExportXLSX = () => {
        if (typeof XLSX === 'undefined') {
            setNotification({ message: 'La librería de exportación no está disponible.', type: 'error' });
            return;
        }
        const rubricSheetData = [["MOMENTOS", "CRITERIOS", "ASPECTOS A OBSERVAR", "EVALUACIÓN", "COMENTARIOS"]];
        processedRubric.forEach((row, index) => {
            rubricSheetData.push([row.moment, row.criterion, row.aspect, rubricData[index]?.level || '', rubricData[index]?.comment || '']);
        });
        const reportSheetData = [["COMPETENCIA", "NIVEL ALCANZADO", "FORTALEZAS", "OPORTUNIDADES DE MEJORA", "NIVEL ESPERADO (DESCRIPCIÓN)"]];
        competencyResults.forEach(result => {
             reportSheetData.push([result.name, result.achievedLevel, result.fortalezas, result.mejoras, result.description]);
        });
        const teacherInfoData = [
            ["CAMPO", "VALOR"],
            ["Docente", teacherInfo.docente?.name],
            ["ID Banner", teacherInfo.idBanner],
            ["NRC Curso", teacherInfo.nrcCurso],
            ["Nombre Curso", teacherInfo.nombreCurso],
            ["Programa", teacherInfo.programa],
            ["Especialista", teacherInfo.especialista],
            ["Fecha Observación", teacherInfo.fechaObs],
            ["Sede", teacherInfo.sede],
        ];
        const wb = XLSX.utils.book_new();
        const wsRubric = XLSX.utils.aoa_to_sheet(rubricSheetData);
        const wsReport = XLSX.utils.aoa_to_sheet(reportSheetData);
        const wsInfo = XLSX.utils.aoa_to_sheet(teacherInfoData);
        XLSX.utils.book_append_sheet(wb, wsInfo, "Información General");
        XLSX.utils.book_append_sheet(wb, wsReport, "Informe de Competencias");
        XLSX.utils.book_append_sheet(wb, wsRubric, "Detalle Rúbrica");
        XLSX.writeFile(wb, `Informe_${teacherInfo.docente?.name.replace(/[\/ ,]/g, '_') || 'Docente'}.xlsx`);
    };

    const truncate = (text, length) => {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    // --- RENDER LOGIC ---
    if (isLoading || !rubricTemplate) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-xl text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">¡Oops! Algo salió mal</h2>
                    <p className="text-gray-700">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700"
                    >
                        Intentar de Nuevo
                    </button>
                </div>
            </div>
        );
    }
    
    if (view === 'report') {
        return (
            <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans relative">
                <StatusModal 
                    status={saveStatus}
                    message={saveMessage}
                    onSuccess={() => {
                        setSaveStatus(null);
                        if (onCancel) onCancel();
                    }}
                    onClose={() => setSaveStatus(null)}
                />
                {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
                <div className="w-full mx-auto bg-white p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 text-center flex-grow">Informe de Seguimiento Pedagógico</h1>
                        <div className="flex items-center">
                            <label className="text-base font-medium mr-2">Vista:</label>
                            <button onClick={() => setSummaryView(v => !v)} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-base">{summaryView ? 'Resumida' : 'General'}</button>
                        </div>
                    </div>
                    
                    <div className="text-center mb-8">
                        <p className="text-lg mb-1">Estimado docente,</p>
                        <p className="font-semibold text-2xl text-indigo-700 mb-2">{teacherInfo.docente?.name}</p>
                        <p className="text-lg text-gray-600">Compartimos con usted el informe que detalla el nivel alcanzado en las competencias del perfil docente UPN.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-8 border-t border-b py-6 text-base">
                        <p><strong>Apellidos y Nombres:</strong> {teacherInfo.docente?.name}</p>
                        <p><strong>Especialista Pedagógico:</strong> {teacherInfo.especialista}</p>
                        <p><strong>Carrera/Departamento:</strong> {teacherInfo.carrera}</p>
                        <p><strong>Facultad:</strong> {teacherInfo.facultad}</p>
                        <p><strong>Curso:</strong> {teacherInfo.nombreCurso}</p>
                        <p><strong>NRC:</strong> {teacherInfo.nrcCurso}</p>
                        <p><strong>Fecha de Observación:</strong> {teacherInfo.fechaObs}</p>
                    </div>

                    <div className="space-y-8">
                        {competencyResults.map((result, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                                <h3 className="font-bold text-2xl text-indigo-800 mb-6">{result.name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-xl text-gray-700">NIVEL ALCANZADO</h4>
                                            <p className="font-bold text-xl text-blue-600 mt-1">{result.achievedLevel}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-xl text-gray-700">NIVEL ESPERADO</h4>
                                            <p className="text-lg text-gray-600 mt-1">{summaryView ? truncate(result.description, 150) : result.description}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-xl text-gray-700">FORTALEZAS</h4>
                                            <textarea value={result.fortalezas} onChange={(e) => handleReportTextChange(index, 'fortalezas', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base h-32" placeholder="Describa las fortalezas observadas..."/>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-xl text-gray-700">OPORTUNIDADES DE MEJORA</h4>
                                            <textarea value={result.mejoras} onChange={(e) => handleReportTextChange(index, 'mejoras', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base h-32" placeholder="Describa las oportunidades de mejora..."/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 border-t-2 border-indigo-200 pt-8 space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectInput label="TIPO DE RETROALIMENTACIÓN" name="feedbackType" value={reportExtras.feedbackType} onChange={handleReportExtrasChange} options={finalFormOptions.feedbackTypes} />
                            <div>
                                <label htmlFor="feedbackDate" className="block text-base font-medium text-gray-700">FECHA RETROALIMENTACIÓN</label>
                                <input type="date" name="feedbackDate" value={reportExtras.feedbackDate} onChange={handleReportExtrasChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="agreements" className="block text-base font-medium text-gray-700">ACUERDOS Y COMPROMISOS</label>
                            <textarea name="agreements" value={reportExtras.agreements} onChange={handleReportExtrasChange} rows="4" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
                        </div>
                         <div>
                            <label htmlFor="feedbackComments" className="block text-base font-medium text-gray-700">COMENTARIOS DE LA RETROALIMENTACIÓN</label>
                            <textarea name="feedbackComments" value={reportExtras.feedbackComments} onChange={handleReportExtrasChange} rows="4" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-center items-center gap-4 mt-8">
                    <button onClick={() => setView('form')} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-transform transform hover:scale-105">
                        ← Volver a la Rúbrica
                    </button>
                    <button onClick={handleSaveOrUpdateData} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105">
                        {initialData ? 'Actualizar Rúbrica' : 'Guardar Rúbrica'}
                    </button>
                    <button onClick={handleExportXLSX} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105">
                        Descargar XLSX
                    </button>
                    <button onClick={handleCancel} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105">
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    // --- MAIN FORM RENDER ---
    return (
        <div className="bg-gray-100 min-h-screen font-sans relative">
            <StatusModal 
                status={saveStatus}
                message={saveMessage}
                onSuccess={() => {
                    setSaveStatus(null);
                    if (onCancel) onCancel();
                }}
                onClose={() => setSaveStatus(null)}
            />
            {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
            <div className="w-full mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{initialData ? 'Editar' : 'Registrar'} {rubricTemplate.name}</h1>

                <div className="mb-8 p-6 border border-gray-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">1. Información General</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SearchableSelect key={`teacher-select-${formResetKey}`} label="DOCENTE" value={teacherInfo.docente} onChange={handleTeacherSelect} options={finalTeacherOptions} resetKey={formResetKey}/>
                        <FormInput label="ID BANNER" name="idBanner" value={teacherInfo.idBanner} readOnly />
                        <FormInput label="NRC CURSO" name="nrcCurso" value={teacherInfo.nrcCurso} onChange={handleInfoChange} />
                        <FormInput label="NOMBRE CURSO" name="nombreCurso" value={teacherInfo.nombreCurso} readOnly />
                        <SelectInput label="PROGRAMA" name="programa" value={teacherInfo.programa} onChange={handleInfoChange} options={finalFormOptions.programs} />
                        <SelectInput label="SEGMENTO DOCENTE" name="segmentoDocente" value={teacherInfo.segmentoDocente} onChange={handleInfoChange} options={finalFormOptions.segments} />
                        
                        {/* [MODIFIED] Using SearchableStringSelect for these fields */}
                        <SearchableStringSelect label="ESPECIALISTA" name="especialista" value={teacherInfo.especialista} onChange={handleInfoChange} options={finalFormOptions.specialists} resetKey={formResetKey} />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">FECHA DE OBS.</label>
                            <input type="date" name="fechaObs" value={teacherInfo.fechaObs} onChange={handleInfoChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        
                        <SearchableStringSelect label="CARRERA" name="carrera" value={teacherInfo.carrera} onChange={handleInfoChange} options={finalFormOptions.careers} resetKey={formResetKey} />
                        <SearchableStringSelect label="FACULTAD" name="facultad" value={teacherInfo.facultad} onChange={handleInfoChange} options={finalFormOptions.faculties} resetKey={formResetKey} />
                        
                        <SelectInput label="SEDE" name="sede" value={teacherInfo.sede} onChange={handleInfoChange} options={finalFormOptions.sedes} />
                        <SelectInput label="N° DE OBSERVACIÓN" name="nObservacion" value={teacherInfo.nObservacion} onChange={handleInfoChange} options={finalFormOptions.observationNumbers} />
                    </div>
                </div>

                <div className="mb-8 p-6 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">2. Rúbrica de Evaluación</h2>
                        <div className="flex items-center gap-4">
                           <button onClick={() => handleBulkMark('NO SE OBSERVÓ')} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-300">Marcar todo como NO SE OBSERVÓ</button>
                           <button onClick={() => handleBulkMark('AUSENTE')} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-300">Marcar todo como AUSENTE</button>
                            <label className="text-sm font-medium">Vista:</label>
                            <button onClick={() => setSummaryView(v => !v)} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm">{summaryView ? 'Resumida' : 'General'}</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-base font-medium text-gray-600 uppercase tracking-wider">Momentos</th>
                                    <th className="px-4 py-3 text-left text-base font-medium text-gray-600 uppercase tracking-wider">Criterios</th>
                                    <th className="px-4 py-3 text-left text-base font-medium text-gray-600 uppercase tracking-wider w-2/5">Aspectos a Observar</th>
                                    <th className="px-4 py-3 text-left text-base font-medium text-gray-600 uppercase tracking-wider">Evaluación</th>
                                    <th className="px-4 py-3 text-left text-base font-medium text-gray-600 uppercase tracking-wider">Comentarios</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {processedRubric.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        {row.showMoment && <td className="px-4 py-4 text-base font-semibold text-gray-800 align-top" rowSpan={processedRubric.filter(r => r.moment === row.moment).length}>{row.moment}</td>}
                                        {row.showCriterion && <td className="px-4 py-4 text-base text-gray-700 align-top" rowSpan={processedRubric.filter(r => r.moment === row.moment && r.criterion === row.criterion).length}>{row.criterion}</td>}
                                        <td className="px-4 py-4 text-base text-gray-800 align-top">{summaryView ? truncate(row.aspect, 80) : row.aspect}</td>
                                        <td className="px-3 py-4 align-top">
                                            <select
                                                value={rubricData[index]?.level || ''}
                                                onChange={(e) => handleRubricChange(index, 'level', e.target.value)}
                                                className="block w-full px-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                {rubricTemplate.evaluationLevels.map(level => (
                                                    <option key={level} value={level}>
                                                        {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-4 align-top">
                                            <input type="text" value={rubricData[index]?.comment || ''} onChange={(e) => handleRubricChange(index, 'comment', e.target.value)} className="w-full text-sm p-1 border border-gray-300 rounded-md"/>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-center items-center gap-4 mt-8 pb-8">
                <button onClick={generateReport} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105">
                    Generar Informe Final
                </button>
                {initialData && (
                    <button onClick={handleSaveOrUpdateData} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105">
                        Actualizar
                    </button>
                )}
                <button onClick={handleCancel} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105">
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default Rubrica;
