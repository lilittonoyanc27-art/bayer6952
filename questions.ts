export interface Question {
  id: number;
  category: 'pasado' | 'futuro' | 'comida' | 'animales' | 'viajes';
  question: string;
  tenseOrTopic: string;
  translationArm: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const CATEGORIES = {
  pasado: {
    id: 'pasado',
    name: 'Pasado',
    color: '#3B82F6', // Blue
    accentColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '⏳',
    description: 'Pretéritos indefinido, imperfecto y perfecto'
  },
  futuro: {
    id: 'futuro',
    name: 'Futuro',
    color: '#8B5CF6', // Purple
    accentColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '🔮',
    description: 'Predicciones, planes y subjuntivo temporal'
  },
  comida: {
    id: 'comida',
    name: 'Comida',
    color: '#EF4444', // Red / Coral
    accentColor: 'bg-red-100 text-red-800 border-red-300',
    icon: '🍳',
    description: 'Platos tradicionales y vocabulario de restaurante'
  },
  animales: {
    id: 'animales',
    name: 'Animales',
    color: '#10B981', // Green
    accentColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: '🦁',
    description: 'Fauna hispanohablante y del mundo'
  },
  viajes: {
    id: 'viajes',
    name: 'Viajes',
    color: '#F59E0B', // Amber
    accentColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: '✈️',
    description: 'Vocabulario de hotel, avión y direcciones'
  }
} as const;

export type CategoryType = keyof typeof CATEGORIES;

export const questions: Question[] = [
  // --- PASADO ---
  {
    id: 1,
    category: 'pasado',
    question: 'Ayer yo ______ con mi abuela por teléfono durante una hora.',
    tenseOrTopic: 'Pretérito Indefinido (Anclado en un momento cerrado)',
    translationArm: 'Երեկ ես մեկ ժամ հեռախոսով խոսեցի տատիկիս հետ։',
    options: ['hablé', 'hablaba', 'he hablado', 'hablaré'],
    correctAnswer: 0,
    explanation: 'Se usa el pretérito indefinido ("hablé") para una acción terminada y puntual en un momento concreto del pasado ("ayer").'
  },
  {
    id: 2,
    category: 'pasado',
    question: 'Cuando yo ______ niño, siempre ______ en el parque con mis amigos.',
    tenseOrTopic: 'Pretérito Imperfecto (Acción habitual en el pasado)',
    translationArm: 'Երբ ես երեխա էի, միշտ ընկերներիս հետ խաղում էի այգում։',
    options: ['fui / jugué', 'era / jugaba', 'sería / jugaría', 'he sido / he jugado'],
    correctAnswer: 1,
    explanation: 'Se utiliza el pretérito imperfecto ("era", "jugaba") para describir situaciones continuas, estados habituales o acciones repetidas de fondo de la infancia.'
  },
  {
    id: 3,
    category: 'pasado',
    question: 'Esta semana el estudiante ______ mucho para su examen de español de mañana.',
    tenseOrTopic: 'Pretérito Perfecto Compuesto (Unidad de tiempo no terminada)',
    translationArm: 'Այս շաբաթ ուսանողը շատ է սովորել վաղվա իսպաներենի քննության համար։',
    options: ['estudió', 'estudiaba', 'ha estudiado', 'estudiaste'],
    correctAnswer: 2,
    explanation: 'Se utiliza el pretérito perfecto compuesto ("ha estudiado") porque la acción ocurre en un marco temporal no terminado en el presente ("esta semana").'
  },
  {
    id: 4,
    category: 'pasado',
    question: 'Mientras nosotros ______ pacíficamente, de repente la luz se ______.',
    tenseOrTopic: 'Imperfecto vs Indefinido (Acción de fondo interrumpida por evento puntual)',
    translationArm: 'Մինչ մենք հանգիստ ընթրում էինք, հանկարծ լույսն անջատվեց։',
    options: ['cenamos / fue', 'cenábamos / iba', 'cenábamos / fue', 'cenamos / iba'],
    correctAnswer: 2,
    explanation: 'La acción de fondo que estaba en progreso se expresa en imperfecto ("cenábamos"), mientras que la interrupción puntual va en indefinido ("se fue").'
  },

  // --- FUTURO ---
  {
    id: 5,
    category: 'futuro',
    question: 'El próximo año nosotros ______ a España para conocer la Alhambra de Granada.',
    tenseOrTopic: 'Futuro Simple de Indicativo (Planes e intenciones en el porvenir)',
    translationArm: 'Հաջորդ տարի մենք կմեկնենք Իսպանիա՝ Գրանադայի Ալհամբրան տեսնելու համար։',
    options: ['viajaremos', 'viajamos', 'viajaríamos', 'viajaron'],
    correctAnswer: 0,
    explanation: 'Para hablar de planes confirmados o intenciones en un tiempo específico posterior al presente ("el próximo año"), empleamos el futuro simple ("viajaremos").'
  },
  {
    id: 6,
    category: 'futuro',
    question: 'Creo que en el año 2050 muchos coches de nuestras ciudades ______.',
    tenseOrTopic: 'Futuro Simple para Predicciones (Hipótesis sobre el futuro)',
    translationArm: 'Կարծում եմ, որ 2050 թվականին մեր քաղաքների շատ մեքենաներ կթռչեն։',
    options: ['vuelan', 'volarán', 'volarían', 'volasen'],
    correctAnswer: 1,
    explanation: 'Se usa el futuro simple ("volarán") para expresar predicciones sobre el futuro asociadas a verbos de opinión como "creo que" o "pienso que".'
  },
  {
    id: 7,
    category: 'futuro',
    question: 'Si estudias con atención hoy, mañana ______ todas las respuestas correctas.',
    tenseOrTopic: 'Oración Condicional Tipo I (Condición real o de alta probabilidad)',
    translationArm: 'Եթե այսօր ուշադիր սովորես, վաղը կիմանաս բոլոր ճիշտ պատասխանները։',
    options: ['sabrás', 'sabes', 'sabrías', 'supiste'],
    correctAnswer: 0,
    explanation: 'En las oraciones condicionales reales (primer tipo), de la condición en presente ("Si estudias") se deriva un resultado con alta probabilidad en futuro simple ("sabrás").'
  },
  {
    id: 8,
    category: 'futuro',
    question: 'Cuando nosotros ______ al hotel de playa esta noche, descansaremos.',
    tenseOrTopic: 'Oraciones Temporales de Futuro (Cuando + Presente de Subjuntivo)',
    translationArm: 'Երբ այսօր երեկոյան հասնենք լողափնյա հյուրանոց, կհանգստանանք։',
    options: ['llegaremos', 'lleguemos', 'llegamos', 'llegaríamos'],
    correctAnswer: 1,
    explanation: 'Las conjunciones temporales de futuro como "cuando" van acompañadas del presente de subjuntivo ("lleguemos") para indicar una acción futura antes de la principal.'
  },

  // --- COMIDA ---
  {
    id: 9,
    category: 'comida',
    question: '¿Cuál es el ingrediente estrella que le da el color rojo a un auténtico gazpacho andaluz?',
    tenseOrTopic: 'Vocabulario e ingredientes clave de la cocina típica española',
    translationArm: 'Ո՞րն է այն գլխավոր բաղադրիչը, որը կարմիր գույն է տալիս իսկական անդալուզյան գասպաչոյին։',
    options: ['Las patatas', 'El tomate', 'El azafrán', 'El pimentón ahumado'],
    correctAnswer: 1,
    explanation: 'El gazpacho andaluz es una de las sopas frías más valoradas de España, cuyos ingredientes principales son tomates jugosos maduros, pepinos, pimientos, ajo y aceite de oliva virgen.'
  },
  {
    id: 10,
    category: 'comida',
    question: 'La tortilla de patatas tradicional en España solo lleva patatas, huevos, aceite y habitualmente:',
    tenseOrTopic: 'Gastronomía clásica española y debates de adición de ingredientes',
    translationArm: 'Իսպանիայում ավանդական կարտοֆիլով տորտիլյան պարունակում է միայն կարտոֆիլ, ձու, ձեթ և սովորաբար՝',
    options: ['Queso manchego', 'Cebolla', 'Chorizo picante', 'Jamón serrano'],
    correctAnswer: 1,
    explanation: 'El gran debate gastronómico nacional divide a los amantes de la tortilla entre partidarios de la cebolla (concebollistas) y opositores (sincebollistas).'
  },
  {
    id: 11,
    category: 'comida',
    question: 'Si vas a la provincia de Valencia, es obligatorio comer el plato estrella hecho en sartén plana:',
    tenseOrTopic: 'Geografía culinaria y platos tradicionales a base de arroz',
    translationArm: 'Եթե գնաք Վալենսիայի նահանգ, պարտադիր պետք է ուտեք հարթ թավայի մեջ պատրաստված գլխավոր կերակուրը՝',
    options: ['El gazpacho', 'La paella', 'El salmorejo', 'Las croquetas de jamón'],
    correctAnswer: 1,
    explanation: 'La paella tradicional de Valencia combina conejo, pollo, caracoles, arroz y una variedad de judías verdes locales, todo cocido uniformemente sobre fuego de leña.'
  },
  {
    id: 12,
    category: 'comida',
    question: 'Cuando terminas de comer en un restaurante español y quieres pagar, ¿cómo pides la cuenta?',
    tenseOrTopic: 'Pragmática y expresiones típicas de cortesía en la mesa',
    translationArm: 'Երբ ավարտում եք ուտելը իսպանական ռեստորանում և ցանկանում եք վճարել, ինչպե՞ս եք խնդրում հաշիվը:',
    options: ['"¡Oiga, comida!"', '"La factura final rápido."', '"La cuenta, por favor."', '"Quiero dar mi dinero."'],
    correctAnswer: 2,
    explanation: '"La cuenta, por favor" es la expresión perfecta, amigable, cortés y de uso generalizado en el mundo hispanohablante.'
  },

  // --- ANIMALES ---
  {
    id: 13,
    category: 'animales',
    question: '¿Qué ave rosada se sostiene graciosamente sobre una sola pata en las lagunas de agua salada?',
    tenseOrTopic: 'Nombres de aves comunes y adjetivos descriptivos',
    translationArm: 'Ո՞ր վարդագույն թռչունն է նրբագեղորեն կանգնում մեկ ոտքի վրա աղի ջրերում:',
    options: ['El águila real', 'El flamenco', 'El loro parlanchín', 'La gaviota marina'],
    correctAnswer: 1,
    explanation: 'El flamenco tiene ese color característico por comer microorganismos, crustáceos y algas ricas en pigmentos betacarotenos.'
  },
  {
    id: 14,
    category: 'animales',
    question: 'El caballo corre a gran velocidad, pero el mamífero terrestre más rápido de todo el planeta es:',
    tenseOrTopic: 'Fauna del planeta y comparativos de velocidad',
    translationArm: 'Ձին վազում է մեծ արագությամբ, բայց ամբողջ մոլորակի ամենաարագ ցամաքային կաթնասունն է՝',
    options: ['El jaguar americano', 'El guepardo', 'El lobo del bosque', 'El antílope veloz'],
    correctAnswer: 1,
    explanation: 'El guepardo es capaz de pasar de 0 a 100 km/h en solo tres segundos y alcanza velocidades récord de hasta 115 km/h en distancias cortas.'
  },
  {
    id: 15,
    category: 'animales',
    question: '¿Qué animal de compañía es considerado el "mejor amigo del hombre" en todas las culturas?',
    tenseOrTopic: 'Léxico de mascotas y proverbios idiomáticos',
    translationArm: 'Ո՞ր ընտանի կենդանին է բոլոր մշակույթներում համարվում «մարդու լավագույն բարեկամը»:',
    options: ['El gato montés', 'El perro', 'El caballo de tiro', 'El loro amazónico'],
    correctAnswer: 1,
    explanation: 'El perro es considerado el compañero más fiel debido a su larga historia de domesticación y su gran inteligencia social.'
  },
  {
    id: 16,
    category: 'animales',
    question: '¿Qué mamífero andino de cuello largo y fina lana lanuda es símbolo de los Andes sudamericanos?',
    tenseOrTopic: 'Geografía de fauna hispanoamericana y camélidos autóctonos',
    translationArm: 'Երկար պարանոցով և նուրբ բրդով անդյան ո՞ր կաթնասունն է հարավամերիկյան Անդերի խորհրդանիշը:',
    options: ['La llama', 'La pantera', 'El tapir silvestre', 'El coatí juguetón'],
    correctAnswer: 0,
    explanation: 'La llama ha sido un animal doméstico vital para el transporte de carga y la provisión de lana de abrigo para las comunidades que habitan los Andes.'
  },

  // --- VIAJES ---
  {
    id: 17,
    category: 'viajes',
    question: 'Para volar o viajar legalmente a un país extranjero fuera de tu continente, necesitas presentar tu:',
    tenseOrTopic: 'Vocabulario administrativo de transporte y documentos internacionales',
    translationArm: 'Քո մայրցամաքից դուրս օտարերկրյա պետություն օրինական ճանապարհով թռչելու կամ ճանապարհորդելու համար անհրաժեշտ է ներկայացնել քո՝',
    options: ['Billete de autobús local', 'Pasaporte vigente', 'Tarjeta de biblioteca', 'Guía de turismo en papel'],
    correctAnswer: 1,
    explanation: 'El pasaporte es el documento oficial aceptado en todo el mundo para cruzar fronteras internacionales y verificar la identidad y nacionalidad.'
  },
  {
    id: 18,
    category: 'viajes',
    question: 'Al llegar a tu hotel reservado por primera vez para registrar tus datos y recoger la llave, haces el:',
    tenseOrTopic: 'Vocabulario práctico del sector hotelero exterior',
    translationArm: 'Առաջին անգամ ամրագրված հյուրանոց ժամանելիս՝ տվյալները գրանցելու և բանալին վերցնելու համար, կատարում ես՝',
    options: ['Check-out o Salida', 'Registrar pérdida de llaves', 'Check-in o Registro de entrada', 'Reclamo de equipaje prioritario'],
    correctAnswer: 2,
    explanation: 'El "check-in" o registro de entrada es necesario para que el hotel asigne la habitación correcta, registre los datos de identidad y entregue las llaves.'
  },
  {
    id: 19,
    category: 'viajes',
    question: 'En los aeropuertos, si llevas recipientes con líquidos mayores de 100 mililitros, debes colocarlos en:',
    tenseOrTopic: 'Normas de tránsito de equipaje y seguridad aérea de aviación',
    translationArm: 'Ուղեբեռի անվտանգության կանոնները օդանավակայաններում',
    options: ['Tu abrigo apretado', 'El equipaje de mano ligero', 'La maleta facturada (que viaja en la bodega del avión)', 'No se permite llevarlos de ninguna forma'],
    correctAnswer: 2,
    explanation: 'Las normas internacionales de seguridad prohíben llevar líquidos en frascos mayores a 100 ml en la cabina. Deben colocarse en la maleta facturada de bodega.'
  },
  {
    id: 20,
    category: 'viajes',
    question: '¿Cuál es la forma más directa e inequívoca para pedir orientación en la calle hacia los trenes subterráneos?',
    tenseOrTopic: 'Pragmática urbana para solicitar indicaciones claras de tránsito',
    translationArm: 'Ո՞րն է փողոցում ստորգետնյա գնացքների (մետրոյի) ուղղությունը հարցնելու ամենաուղիղ և հստակ ձևը:',
    options: ['"¿Dónde está la estación de metro más cercana?"', '"¿Cuánto cuesta el billete ordinario?"', '"¿Adónde conducen estos raíles metálicos?"', '"¿Me da un mapa de la ciudad?"'],
    correctAnswer: 0,
    explanation: 'Esta pregunta permite obtener de forma rápida y concisa las instrucciones de dirección para llegar caminando o en transporte al metro.'
  }
];
