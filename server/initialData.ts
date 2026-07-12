import { Product, Brand, Category, Order, User } from '../src/types';

export const INITIAL_BRANDS: Brand[] = [
  { id: '1', name: 'Honda', slug: 'honda' },
  { id: '2', name: 'Yamaha', slug: 'yamaha' },
  { id: '3', name: 'Suzuki', slug: 'suzuki' },
  { id: '4', name: 'Kawasaki', slug: 'kawasaki' },
  { id: '5', name: 'Bajaj', slug: 'bajaj' },
  { id: '6', name: 'KTM', slug: 'ktm' },
  { id: '7', name: 'Motomel', slug: 'motomel' },
  { id: '8', name: 'Gilera', slug: 'gilera' },
  { id: '9', name: 'Corven', slug: 'corven' },
  { id: '10', name: 'Zanella', slug: 'zanella' },
  { id: '11', name: 'Benelli', slug: 'benelli' },
  { id: '12', name: 'CFMoto', slug: 'cfmoto' }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Repuestos', slug: 'repuestos' },
  { id: '2', name: 'Accesorios', slug: 'accesorios' },
  { id: '3', name: 'Lubricantes', slug: 'lubricantes' },
  { id: '4', name: 'Frenos', slug: 'frenos' },
  { id: '5', name: 'Suspensión', slug: 'suspension' },
  { id: '6', name: 'Electricidad', slug: 'electricidad' },
  { id: '7', name: 'Motor', slug: 'motor' },
  { id: '8', name: 'Transmisión', slug: 'transmision' },
  { id: '9', name: 'Escape', slug: 'escape' },
  { id: '10', name: 'Indumentaria', slug: 'indumentaria' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Kit Transmisión Completa Yamasida Reforzada',
    sku: 'TRA-YAM-01',
    brand: 'Yamaha',
    price: 42500,
    offerPrice: 38250,
    stock: 15,
    category: 'Transmisión',
    description: 'Kit de transmisión completo Yamasida de alta durabilidad, fabricado con acero SAE 1045 de alta resistencia. Ideal para el uso cotidiano urbano y viajes cortos. Garantiza suavidad en la marcha y máxima transferencia de potencia.',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Cadena': '520H x 114L Reforzada sin O-Ring',
      'Corona': '45 Dientes Acero 1045',
      'Piñón': '14 Dientes Termotratado',
      'Origen': 'Japón',
      'Durabilidad Estimada': '18,500 km'
    },
    tags: ['transmision', 'cadena', 'piñon', 'corona', 'reforzado'],
    compatibleMotos: ['Yamaha', 'Suzuki'],
    compatibleModels: ['Yamaha FZ', 'Yamaha YBR125', 'Suzuki GN125'],
    compatibleDisplacements: ['125cc', '150cc']
  },
  {
    id: 'prod-2',
    name: 'Pastillas de Freno Brembo Carbon Ceramic',
    sku: 'FRE-BRE-02',
    brand: 'Brembo',
    price: 18400,
    offerPrice: 16500,
    stock: 24,
    category: 'Frenos',
    description: 'Pastillas de freno Brembo fabricadas con compuesto carbón-cerámico que garantiza una excelente respuesta de frenado tanto en frío como en caliente, reduciendo el desgaste y evitando ruidos molestos. Ideal para conducción urbana y deportiva ligera.',
    images: [
      'https://images.unsplash.com/photo-1558981852-4105e412a120?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Compuesto': 'Carbón-Cerámico de alto coeficiente de fricción',
      'Posición': 'Delantera',
      'Uso Recomendado': 'Calle / Turismo / Deportivo',
      'Certificación': 'TÜV / ABE',
      'Resistencia Térmica': 'Hasta 400°C sin fatiga'
    },
    tags: ['frenos', 'pastillas', 'brembo', 'frenado', 'seguridad'],
    compatibleMotos: ['KTM', 'Bajaj', 'Yamaha', 'Honda'],
    compatibleModels: ['KTM Duke 200', 'Bajaj Rouser 200', 'Yamaha FZ', 'Honda XR150'],
    compatibleDisplacements: ['150cc', '200cc', '250cc']
  },
  {
    id: 'prod-3',
    name: 'Aceite Motul 7100 4T 10W40 Sintético Premium',
    sku: 'LUB-MOT-10W40',
    brand: 'Motul',
    price: 21500,
    stock: 50,
    category: 'Lubricantes',
    description: 'Lubricante 100% Sintético con tecnología de Éster para motocicletas de 4 tiempos. Diseñado para ofrecer la máxima protección al motor, excelente funcionamiento del embrague húmedo y durabilidad insuperable en altas revoluciones.',
    images: [
      'https://images.unsplash.com/photo-1635812920701-f2f2f7fc597b?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Tipo de Lubricante': '100% Sintético con Éster',
      'Grado de Viscosidad': '10W40',
      'Normativas': 'JASO MA2 - API SN / SM / SL',
      'Contenido Neto': '1 Litro',
      'Color': 'Rojo Translúcido Característico'
    },
    tags: ['lubricantes', 'aceite', 'motul', 'sintetico', 'service'],
    compatibleMotos: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Bajaj', 'KTM', 'Benelli', 'CFMoto'],
    compatibleModels: ['Honda Wave 110', 'Honda XR150', 'Yamaha YBR125', 'Yamaha FZ', 'Bajaj Rouser 200', 'KTM Duke 200'],
    compatibleDisplacements: ['110cc', '125cc', '150cc', '200cc', '250cc', '300cc', '400cc', '500cc', '650cc', '1000cc']
  },
  {
    id: 'prod-4',
    name: 'Filtro de Aceite K&N KN-112 de Alto Flujo',
    sku: 'REP-KN-112',
    brand: 'K&N',
    price: 8900,
    stock: 35,
    category: 'Repuestos',
    description: 'Filtro de aceite K&N desarrollado con material filtrante sintético premium para soportar niveles extremos de presión del aceite y entregar una excelente tasa de flujo constante. Protege de impurezas microscópicas dañinas.',
    images: [
      'https://images.unsplash.com/photo-1594262481311-5a022e6db70e?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Material Filtrante': 'Sintético de Alto Flujo',
      'Válvula Bypass': 'Sí, siliconada',
      'Uso Recomendado': 'Aceite sintético, mineral y semisintético',
      'Perno de Extracción': 'No compatible en este modelo'
    },
    tags: ['repuestos', 'filtro', 'aceite', 'k&n', 'mantenimiento'],
    compatibleMotos: ['Honda', 'Kawasaki'],
    compatibleModels: ['Honda XR150', 'Kawasaki KLX250'],
    compatibleDisplacements: ['150cc', '250cc']
  },
  {
    id: 'prod-5',
    name: 'Escape Deportivo Akrapovič Slip-On Carbon Fiber',
    sku: 'ESC-AKR-DUK',
    brand: 'Akrapovic',
    price: 345000,
    offerPrice: 310000,
    stock: 3,
    category: 'Escape',
    description: 'Sistema de escape Slip-On de la prestigiosa firma Akrapovič. Fabricado en fibra de carbono genuina y titanio aeroespacial. Incrementa el torque a medias revoluciones, reduce notablemente el peso total del conjunto de la moto y provee un sonido ronco, agresivo y sofisticado.',
    images: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Material de Camisa': 'Fibra de Carbono Premium Gloss',
      'Material de Copa': 'Titanio chorreador de arena',
      'Reducción de Peso': '-2.2 kg respecto al silenciador OEM',
      'Ganancia Potencia': '+1.4 HP a 9200 RPM',
      'DB Killer extraíble': 'Sí, incluido'
    },
    tags: ['escape', 'akrapovic', 'deportivo', 'potencia', 'carbono'],
    compatibleMotos: ['KTM', 'Bajaj', 'Benelli', 'CFMoto'],
    compatibleModels: ['KTM Duke 200', 'Bajaj Rouser 200', 'CFMoto NK250'],
    compatibleDisplacements: ['200cc', '250cc', '300cc', '400cc']
  },
  {
    id: 'prod-6',
    name: 'Casco Integral LS2 FF320 Stream Evo Monocolor',
    sku: 'IND-LS2-FF320',
    brand: 'LS2',
    price: 145000,
    offerPrice: 129000,
    stock: 8,
    category: 'Indumentaria',
    description: 'Casco integral LS2 con visor solar interno desplegable y calota exterior aerodinámica fabricada en HPTT para ofrecer ligereza y excelente absorción de impactos. Interiores desmontables e hipoalergénicos con cierre micrométrico de alta seguridad.',
    images: [
      'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Certificados de Seguridad': 'ECE 22.05 y homologación nacional',
      'Material Exterior': 'HPTT (Termoplástico de Alta Presión)',
      'Doble Visor': 'Visor transparente clase A + Visor solar interno',
      'Sistema de Ventilación': 'Entradas regulables frontales y superiores'
    },
    tags: ['indumentaria', 'casco', 'ls2', 'seguridad', 'proteccion'],
    compatibleMotos: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Bajaj', 'KTM', 'Motomel', 'Zanella', 'Corven', 'Gilera'],
    compatibleModels: ['Honda Wave 110', 'Yamaha YBR125', 'Yamaha FZ', 'KTM Duke 200', 'Bajaj Rouser 200'],
    compatibleDisplacements: ['110cc', '125cc', '150cc', '200cc', '250cc', '300cc', '400cc', '500cc', '650cc', '1000cc']
  },
  {
    id: 'prod-7',
    name: 'Guantes Deportivos Alpinestars SMX-1 Air V2',
    sku: 'IND-ALP-SMX1',
    brand: 'Alpinestars',
    price: 68000,
    stock: 12,
    category: 'Indumentaria',
    description: 'Guantes ligeros de caña corta desarrollados en cuero premium y malla ventilada 3D para una transpirabilidad excelente en climas cálidos. Cuentan con un protector rígido de nudillos de carbono que ofrece máxima resistencia contra abrasión e impactos.',
    images: [
      'https://images.unsplash.com/photo-1594262481311-5a022e6db70e?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Línea de Diseño': 'SMX Series Premium',
      'Material Base': 'Cuero bovino genuino y malla de ventilación extrema',
      'Nivel de Certificación': 'CE Nivel 1 homologado para moto',
      'Dedo Capacitivo': 'Permite manejo de GPS/Móvil con dedo índice'
    },
    tags: ['indumentaria', 'guantes', 'alpinestars', 'verano', 'proteccion'],
    compatibleMotos: ['Honda', 'Yamaha', 'Suzuki', 'KTM', 'Bajaj'],
    compatibleModels: ['Honda XR150', 'Yamaha FZ', 'KTM Duke 200'],
    compatibleDisplacements: ['125cc', '150cc', '200cc', '250cc', '300cc']
  },
  {
    id: 'prod-8',
    name: 'Batería de Gel Yuasa YTX7L-BS Sellada',
    sku: 'ELE-YUA-YTX7L',
    brand: 'Yuasa',
    price: 39500,
    stock: 18,
    category: 'Electricidad',
    description: 'Batería Yuasa original sellada de gel electrolítico de bajo mantenimiento y alta tecnología anti-vibraciones. Entrega un arranque en frío instantáneo superior bajo climas extremos. No requiere activación líquida inicial.',
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Amperaje / Voltaje': '12 Volts / 6.3 Amperios',
      'CCA': '100 Amperios de arranque frío',
      'Tecnología': 'VRLA Gel Electrolítica Absorbida',
      'Garantía': '6 Meses oficiales'
    },
    tags: ['electricidad', 'bateria', 'yuasa', 'gel', 'arranque'],
    compatibleMotos: ['Honda', 'Yamaha', 'KTM', 'Bajaj'],
    compatibleModels: ['Honda XR150', 'Yamaha YBR125', 'KTM Duke 200', 'Bajaj Rouser 200'],
    compatibleDisplacements: ['125cc', '150cc', '200cc']
  },
  {
    id: 'prod-9',
    name: 'Amortiguador Trasero Reforzado Far Wave',
    sku: 'SUS-FAR-WAV',
    brand: 'Far',
    price: 34000,
    offerPrice: 29900,
    stock: 10,
    category: 'Suspensión',
    description: 'Amortiguador trasero de doble espiral progresivo marca Far, líder e internacionalmente reconocido en el mercado de la suspensión urbana. Ofrece una amortiguación sumamente suave absorbiendo baches e irregularidades agresivas.',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Largo entre Ojos': '340 milímetros exactos',
      'Regulaciones': 'Precarga ajustable en 5 posiciones mecánicas',
      'Cantidad': 'Par (Izquierdo y Derecho)',
      'Pintura de Resorte': 'Negro Epoxi Horneado anticorrosivo'
    },
    tags: ['suspension', 'amortiguador', 'trasero', 'wave', 'reforzado'],
    compatibleMotos: ['Honda', 'Motomel', 'Gilera', 'Zanella', 'Corven'],
    compatibleModels: ['Honda Wave 110', 'Motomel Blitz 110', 'Gilera Smash 110', 'Zanella ZB 110', 'Corven Energy 110'],
    compatibleDisplacements: ['110cc']
  },
  {
    id: 'prod-10',
    name: 'Kit Alarma Presencia Positron Duo FX 350',
    sku: 'ELE-POS-D350',
    brand: 'Positron',
    price: 49500,
    offerPrice: 42500,
    stock: 14,
    category: 'Electricidad',
    description: 'Sistema de alarma por sensor de presencia remoto de la marca líder Positron. Bloquea el encendido electrónico del motor automáticamente cuando el control remoto por presencia se aleja a más de 15 metros del rodado.',
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Controles Incluidos': '2 Controles integrales de presencia',
      'Consumo Batería': 'Ultra bajo consumo (menor a 1.8 mA)',
      'Sirena Integrada': '120dB piezoeléctrica impermeable',
      'Corte de Corriente': 'Pasivo automático inteligente'
    },
    tags: ['electricidad', 'alarma', 'seguridad', 'antirrobo', 'positron'],
    compatibleMotos: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Bajaj', 'KTM', 'Motomel', 'Zanella', 'Corven', 'Gilera', 'Benelli', 'CFMoto'],
    compatibleModels: ['Honda Wave 110', 'Honda XR150', 'Yamaha YBR125', 'Yamaha FZ', 'Bajaj Rouser 200', 'KTM Duke 200'],
    compatibleDisplacements: ['110cc', '125cc', '150cc', '200cc', '250cc', '300cc', '400cc', '500cc', '650cc']
  },
  {
    id: 'prod-11',
    name: 'Faros Auxiliares Exploradores LED Cree 120W Dual',
    sku: 'ACC-LED-CREE',
    brand: 'LED-MOTO',
    price: 31000,
    stock: 22,
    category: 'Accesorios',
    description: 'Juego de faros auxiliares metálicos impermeables IP68 con tecnología estadounidense Cree LED de alta luminosidad. Excelente apertura lumínica focalizada para trayectos nocturnos difíciles o zonas rurales con nula iluminación de ruta.',
    images: [
      'https://images.unsplash.com/photo-1558980331-50e412a1202e?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Flujo Lumínico': '12,000 Lúmenes totales',
      'Consumo Eléctrico': '60W por faro (120W total)',
      'Tonalidad Luz': '6500 Kelvins (Blanco frío puro)',
      'Estructura de Gabinete': 'Aluminio de aviación anodizado negro'
    },
    tags: ['accesorios', 'luces', 'led', 'faros', 'exploradoras', 'viajes'],
    compatibleMotos: ['Yamaha', 'Honda', 'Kawasaki', 'Suzuki', 'KTM', 'Bajaj', 'Benelli', 'CFMoto', 'Corven'],
    compatibleModels: ['Honda XR150', 'Yamaha FZ', 'KTM Duke 200', 'Bajaj Rouser 200', 'Corven Triax 250'],
    compatibleDisplacements: ['150cc', '200cc', '250cc', '300cc', '400cc', '500cc', '650cc', '1000cc']
  },
  {
    id: 'prod-12',
    name: 'Disco de Freno Delantero Ventilado Promoto',
    sku: 'FRE-PRO-DISC',
    brand: 'Promoto',
    price: 27500,
    stock: 9,
    category: 'Frenos',
    description: 'Disco de freno delantero lobulado de alta ventilación Promoto. Proporciona una disipación inmediata del calor excedente, optimizando la presión sobre la maneta y control de la pastilla del cáliper bajo situaciones severas de parada de pánico.',
    images: [
      'https://images.unsplash.com/photo-1558981852-4105e412a120?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Diámetro de Disco': '240 mm',
      'Material de Fabricación': 'Acero inoxidable de alto carbono templado',
      'Formación de Ventilado': 'Cavidades lobuladas perimetrales',
      'Espesor Nominal': '4 mm estándar de diseño'
    },
    tags: ['frenos', 'disco', 'delantero', 'ventilado', 'promoto'],
    compatibleMotos: ['Honda', 'Motomel', 'Zanella', 'Corven'],
    compatibleModels: ['Honda Wave 110', 'Honda XR150', 'Motomel Blitz 110', 'Corven Energy 110'],
    compatibleDisplacements: ['110cc', '150cc']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    userId: 'user-1',
    isGuest: false,
    customerName: 'Nahuel',
    customerLastName: 'Santos',
    customerEmail: 'santos.nahuel04@gmail.com',
    customerPhone: '+54 9 11 1234-5678',
    address: 'Av. del Libertador 4500',
    city: 'CABA',
    state: 'Buenos Aires',
    zipCode: '1426',
    items: [
      {
        productId: 'prod-3',
        sku: 'LUB-MOT-10W40',
        name: 'Aceite Motul 7100 4T 10W40 Sintético Premium',
        price: 21500,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1635812920701-f2f2f7fc597b?q=80&w=600&auto=format&fit=crop'
      },
      {
        productId: 'prod-4',
        sku: 'REP-KN-112',
        name: 'Filtro de Aceite K&N KN-112 de Alto Flujo',
        price: 8900,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1594262481311-5a022e6db70e?q=80&w=600&auto=format&fit=crop'
      }
    ],
    total: 51900,
    status: 'Preparando pedido',
    createdAt: '2026-06-18T14:35:00Z',
    notes: 'Por favor despachar por la tarde'
  },
  {
    id: 'ORD-1002',
    isGuest: true,
    customerName: 'Carlos',
    customerLastName: 'Pérez',
    customerEmail: 'carlosperez@gmail.com',
    customerPhone: '+54 9 11 9876-5432',
    address: 'Calle Falsa 123',
    city: 'Rosario',
    state: 'Santa Fe',
    zipCode: '2000',
    items: [
      {
        productId: 'prod-2',
        sku: 'FRE-BRE-02',
        name: 'Pastillas de Freno Brembo Carbon Ceramic',
        price: 16500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1558981852-4105e412a120?q=80&w=600&auto=format&fit=crop'
      }
    ],
    total: 16500,
    status: 'Enviado',
    createdAt: '2026-06-17T11:20:00Z'
  },
  {
    id: 'ORD-1003',
    userId: 'user-1',
    isGuest: false,
    customerName: 'Nahuel',
    customerLastName: 'Santos',
    customerEmail: 'santos.nahuel04@gmail.com',
    customerPhone: '+54 9 11 1234-5678',
    address: 'Av. del Libertador 4500',
    city: 'CABA',
    state: 'Buenos Aires',
    zipCode: '1426',
    items: [
      {
        productId: 'prod-12',
        sku: 'FRE-PRO-DISC',
        name: 'Disco de Freno Delantero Ventilado Promoto',
        price: 27500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1558981852-4105e412a120?q=80&w=600&auto=format&fit=crop'
      }
    ],
    total: 27500,
    status: 'Entregado',
    createdAt: '2026-06-10T09:12:00Z'
  }
];
