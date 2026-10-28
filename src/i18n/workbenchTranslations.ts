import { Language } from '../types';

export interface WorkbenchContent {
  topBar: {
    home: string;
    workspaceDesc: string;
    myTeam: string;
    free: string;
    support: string;
    lightMode: string;
    darkMode: string;
  };
  sidebar: {
    creative: string;
    developer: string;
    upgradeTitle: string;
    upgradeSubtitle: string;
    socialMedia: string;
    caseStudies: string;
    aboutFounder: string;
    contactUs: string;
  };
  production: {
    imageAndVideo: {
      title: string;
      desc: string;
      badge: string;
    };
    textToSpeech: {
      title: string;
      desc: string;
    };
    createVoice: {
      title: string;
      desc: string;
    };
    agent: {
      title: string;
      desc: string;
      badge: string;
    };
  };
  subTools: {
    storyStudio: string;
    audioSeparation: string;
    speechToText: string;
    voiceChanger: string;
    soundEffect: string;
  };
  newsBanner: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  projects: {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
    buttonText: string;
  };
  generationHistory: {
    title: string;
    more: string;
    assistantName: string;
    sampleText: string;
    play: string;
    download: string;
    share: string;
  };
  myVoiceLibrary: {
    title: string;
    more: string;
    componentsTitle: string;
    componentsDesc: string;
    knowledgeTitle: string;
    knowledgeDesc: string;
  };
  tutorials: {
    title: string;
    more: string;
    items: Array<{
      id: string;
      title: string;
      tag: string;
    }>;
    danielBrainTitle: string;
    danielBrainDesc: string;
  };
  ask: string;
}

const ES_TRANSLATIONS: WorkbenchContent = {
  topBar: {
    home: 'Inicio',
    workspaceDesc: 'Autonomous Systems Workspace',
    myTeam: 'My Team',
    free: 'Free',
    support: 'Soporte y Contacto',
    lightMode: 'Modo Claro',
    darkMode: 'Modo Oscuro',
  },
  sidebar: {
    creative: 'Creativo',
    developer: 'Desarrollador',
    upgradeTitle: 'ACTUALIZA A...',
    upgradeSubtitle: 'Ver Planes y Precios',
    socialMedia: 'Redes Sociales',
    caseStudies: 'Casos de Estudio',
    aboutFounder: 'Sobre el Fundador',
    contactUs: 'Contáctanos',
  },
  production: {
    imageAndVideo: {
      title: 'Imagen y video',
      desc: 'Genera imágenes y videos, y sincroniza los labios con IA',
      badge: 'New',
    },
    textToSpeech: {
      title: 'Texto a Voz',
      desc: 'Convierte cualquier texto en voz natural en segundos',
    },
    createVoice: {
      title: 'Crear voz',
      desc: 'Crea una copia digital de cualquier voz con nuestra avanzada IA',
    },
    agent: {
      title: 'Agente',
      desc: 'Crea e integra en tu sitio web un servicio de atención al cliente por voz con IA en tiempo real',
      badge: 'New',
    },
  },
  subTools: {
    storyStudio: 'Estudio de Historias',
    audioSeparation: 'Separación de Audio',
    speechToText: 'Conversión de voz a texto',
    voiceChanger: 'Cambiador de voz',
    soundEffect: 'Efecto de sonido',
  },
  newsBanner: {
    title: '4haus AI Studio: Asistente de Creación Web',
    subtitle: 'Diseña, genera y despliega sitios web inteligentes y agentes autónomos con IA en minutos.',
    buttonText: 'Crear sitio ahora',
  },
  projects: {
    title: 'Proyectos de Sitios Web',
    emptyTitle: 'Comienza a crear tu sitio web con IA',
    emptyDesc: 'Describe tu negocio y nuestro asistente generará la arquitectura web, contenido y componentes en vivo.',
    buttonText: 'Crear un nuevo website con IA',
  },
  generationHistory: {
    title: 'Historia de lo que vas creando',
    more: 'Más',
    assistantName: 'Asistente Daniel 1.0',
    sampleText: 'He desplegado la estructura de tu nuevo sitio web con arquitectura responsiva, formulario de contacto y agente de IA integrado.',
    play: 'Reproducir',
    download: 'Descargar',
    share: 'Compartir',
  },
  myVoiceLibrary: {
    title: 'Biblioteca de Recursos & Websites',
    more: 'Más',
    componentsTitle: 'Librería de Websites & Templates',
    componentsDesc: 'Plantillas de páginas web listas para producción con IA',
    knowledgeTitle: 'Knowledge Library (Libros)',
    knowledgeDesc: 'Arquitectura de software, diseño web y crecimiento empresarial',
  },
  tutorials: {
    title: 'Tutoriales',
    more: 'Más',
    items: [
      {
        id: 't1',
        title: '1. Cómo crear tu primer sitio web completo en 10 minutos con el Asistente de IA de 4haus',
        tag: 'Creación Web con IA',
      },
      {
        id: 't2',
        title: '2. Integración de Daniel 1.0 como Agente de Voz y Atención 24/7 en tu página web',
        tag: 'AI Agents',
      },
      {
        id: 't3',
        title: '3. Personalización de plantillas y publicación con dominio propio en Websites Library',
        tag: 'Websites Library',
      },
      {
        id: 't4',
        title: '4. Configuración del Equipo, Billetera y Métricas de Créditos para agencias y empresas',
        tag: 'Plataforma y Equipo',
      },
    ],
    danielBrainTitle: 'DANIEL NEURAL BRAIN',
    danielBrainDesc: 'Usa el botón de "Preguntar" con animación de Daniel 1.0 en la esquina inferior derecha para resolver dudas o asistirte en vivo.',
  },
  ask: 'Preguntar',
};

const EN_TRANSLATIONS: WorkbenchContent = {
  topBar: {
    home: 'Home',
    workspaceDesc: 'Autonomous Systems Workspace',
    myTeam: 'My Team',
    free: 'Free',
    support: 'Support & Contact',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
  },
  sidebar: {
    creative: 'Creative',
    developer: 'Developer',
    upgradeTitle: 'UPGRADE TO...',
    upgradeSubtitle: 'View Plans & Pricing',
    socialMedia: 'Social Networks',
    caseStudies: 'Case Studies',
    aboutFounder: 'About the Founder',
    contactUs: 'Contact Us',
  },
  production: {
    imageAndVideo: {
      title: 'Image and Video',
      desc: 'Generate images and videos, and sync lips with AI',
      badge: 'New',
    },
    textToSpeech: {
      title: 'Text to Speech',
      desc: 'Convert any text into natural-sounding voice in seconds',
    },
    createVoice: {
      title: 'Create Voice',
      desc: 'Create a digital clone of any voice with our advanced neural AI',
    },
    agent: {
      title: 'Agent',
      desc: 'Create and integrate real-time AI voice customer service on your website',
      badge: 'New',
    },
  },
  subTools: {
    storyStudio: 'Story Studio',
    audioSeparation: 'Audio Separation',
    speechToText: 'Speech to Text',
    voiceChanger: 'Voice Changer',
    soundEffect: 'Sound Effect',
  },
  newsBanner: {
    title: '4haus AI Studio: Web Creation Assistant',
    subtitle: 'Design, generate and deploy intelligent websites and autonomous AI agents in minutes.',
    buttonText: 'Create website now',
  },
  projects: {
    title: 'Website Projects',
    emptyTitle: 'Start creating your website with AI',
    emptyDesc: 'Describe your business or venture and our AI assistant will generate responsive code, structure and live copy.',
    buttonText: 'Create a new website with AI',
  },
  generationHistory: {
    title: 'Creation & Generation History',
    more: 'More',
    assistantName: 'Daniel 1.0 Assistant',
    sampleText: 'I have deployed your website architecture with high-conversion components, clean typography and an integrated AI Agent.',
    play: 'Play',
    download: 'Download',
    share: 'Share',
  },
  myVoiceLibrary: {
    title: 'Resources & Websites Library',
    more: 'More',
    componentsTitle: 'Websites Library & Templates',
    componentsDesc: 'Production-ready website templates engineered with AI',
    knowledgeTitle: 'Knowledge Library (Books)',
    knowledgeDesc: 'Software architecture, web development and business scaling',
  },
  tutorials: {
    title: 'Tutorials',
    more: 'More',
    items: [
      {
        id: 't1',
        title: '1. How to create your first full website in 10 minutes using 4haus AI Assistant',
        tag: 'AI Web Creation',
      },
      {
        id: 't2',
        title: '2. Integrating Daniel 1.0 as a 24/7 Voice & Customer Support Agent on your site',
        tag: 'AI Agents',
      },
      {
        id: 't3',
        title: '3. Customizing templates and publishing with custom domains in Websites Library',
        tag: 'Websites Library',
      },
      {
        id: 't4',
        title: '4. Team Settings, Wallet & Credit usage monitoring for agencies and founders',
        tag: 'Platform & Teams',
      },
    ],
    danielBrainTitle: 'DANIEL NEURAL BRAIN',
    danielBrainDesc: 'Use the bottom-right "Ask" button with Daniel 1.0 animation to get immediate guidance or live co-pilot assistance.',
  },
  ask: 'Ask',
};

const FR_TRANSLATIONS: WorkbenchContent = {
  ...EN_TRANSLATIONS,
  topBar: {
    home: 'Accueil',
    workspaceDesc: 'Espace Systèmes Autonomes',
    myTeam: 'Mon Équipe',
    free: 'Gratuit',
    support: 'Support & Contact',
    lightMode: 'Mode Clair',
    darkMode: 'Mode Sombre',
  },
  sidebar: {
    ...EN_TRANSLATIONS.sidebar,
    creative: 'Créatif',
    developer: 'Développeur',
    upgradeTitle: 'METTRE À NIVEAU...',
  },
  production: {
    imageAndVideo: {
      title: 'Image et vidéo',
      desc: 'Générez des images et vidéos, et synchronisez les lèvres avec l’IA',
      badge: 'Nouveau',
    },
    textToSpeech: {
      title: 'Texte en Parole',
      desc: 'Convertissez n’importe quel texte en voix naturelle en quelques secondes',
    },
    createVoice: {
      title: 'Créer une voix',
      desc: 'Créez un clone numérique de n’importe quelle voix avec notre IA avancée',
    },
    agent: {
      title: 'Agent',
      desc: 'Créez et intégrez un service client vocal par IA en temps réel',
      badge: 'Nouveau',
    },
  },
  subTools: {
    storyStudio: 'Studio d’Histoires',
    audioSeparation: 'Séparation Audio',
    speechToText: 'Parole en Texte',
    voiceChanger: 'Changeur de Voix',
    soundEffect: 'Effet Sonore',
  },
  projects: {
    title: 'Projets',
    emptyTitle: 'Commencez votre voyage de création audio',
    emptyDesc: 'Story Studio vous permet de combiner texte, audio et effets sonores sur une piste multiple.',
    buttonText: 'Créer un nouveau projet studio',
  },
  generationHistory: {
    ...EN_TRANSLATIONS.generationHistory,
    title: 'Historique de génération',
    more: 'Plus',
    play: 'Lire',
    download: 'Télécharger',
    share: 'Partager',
  },
  tutorials: {
    ...EN_TRANSLATIONS.tutorials,
    title: 'Tutoriels',
    more: 'Plus',
  },
  ask: 'Demander',
};

const ZH_TRANSLATIONS: WorkbenchContent = {
  ...EN_TRANSLATIONS,
  topBar: {
    home: '首页',
    workspaceDesc: '自主智能系统工作区',
    myTeam: '我的团队',
    free: '免费版',
    support: '帮助与支持',
    lightMode: '浅色模式',
    darkMode: '深色模式',
  },
  sidebar: {
    ...EN_TRANSLATIONS.sidebar,
    creative: '创意工作室',
    developer: '开发者',
    upgradeTitle: '升级到专业版...',
  },
  production: {
    imageAndVideo: {
      title: '图像与视频',
      desc: '通过AI生成图像和视频，并自动完成唇形同步',
      badge: '新上线',
    },
    textToSpeech: {
      title: '文字转语音',
      desc: '秒级将任意文本转化为极具表现力的自然人声',
    },
    createVoice: {
      title: '声音克隆',
      desc: '利用先进神经网络AI快速克隆专属高保真数字音色',
    },
    agent: {
      title: '实时AI智能体',
      desc: '在您的网站中无缝嵌入实时语音AI客服与交互式助手',
      badge: '新上线',
    },
  },
  subTools: {
    storyStudio: '故事工作坊',
    audioSeparation: '人声伴奏分离',
    speechToText: '语音识别转写',
    voiceChanger: 'AI实时变声',
    soundEffect: '音效合成',
  },
  newsBanner: {
    title: 'Fish Audio MCP 重大更新',
    subtitle: '现已全面支持通过自主工作流生成图像、视频与数字资产。',
    buttonText: '立即连接',
  },
  projects: {
    title: '我的项目',
    emptyTitle: '开启您的音频与创意之旅',
    emptyDesc: 'Story Studio 让您可以在多轨时间轴上轻松混合文本、语音和环境音效。',
    buttonText: '新建工作室项目',
  },
  generationHistory: {
    ...EN_TRANSLATIONS.generationHistory,
    title: '生成记录',
    more: '查看全部',
    assistantName: '经典数字助理',
    play: '播放',
    download: '下载',
    share: '分享',
  },
  tutorials: {
    ...EN_TRANSLATIONS.tutorials,
    title: '实战教程',
    more: '查看更多',
  },
  ask: '提问',
};

const DE_TRANSLATIONS: WorkbenchContent = {
  ...EN_TRANSLATIONS,
  topBar: {
    home: 'Startseite',
    workspaceDesc: 'Autonomes System Studio',
    myTeam: 'Mein Team',
    free: 'Kostenlos',
    support: 'Support & Kontakt',
    lightMode: 'Heller Modus',
    darkMode: 'Dunkler Modus',
  },
  production: {
    imageAndVideo: {
      title: 'Bild & Video',
      desc: 'Erstellen Sie Bilder und Videos mit KI-Lippensynchronisation',
      badge: 'Neu',
    },
    textToSpeech: {
      title: 'Text-to-Speech',
      desc: 'Wandeln Sie Text in Sekundenschnelle in natürliche Sprache um',
    },
    createVoice: {
      title: 'Stimme erstellen',
      desc: 'Erstellen Sie einen digitalen Klon jeder Stimme mit modernster KI',
    },
    agent: {
      title: 'KI-Agent',
      desc: 'Integrieren Sie einen Echtzeit-KI-Sprachkundendienst auf Ihrer Website',
      badge: 'Neu',
    },
  },
  subTools: {
    storyStudio: 'Geschichten-Studio',
    audioSeparation: 'Audiotrennung',
    speechToText: 'Sprache zu Text',
    voiceChanger: 'Stimmverzerrer',
    soundEffect: 'Soundeffekt',
  },
  projects: {
    title: 'Projekte',
    emptyTitle: 'Beginnen Sie Ihre Audio-Kreation',
    emptyDesc: 'Kombinieren Sie Text, Audio und Soundeffekte in einer Mehrspur-Timeline.',
    buttonText: 'Neues Studioprojekt erstellen',
  },
  generationHistory: {
    ...EN_TRANSLATIONS.generationHistory,
    title: 'Generierungsverlauf',
    more: 'Mehr',
    play: 'Abspielen',
    download: 'Herunterladen',
    share: 'Teilen',
  },
  tutorials: {
    ...EN_TRANSLATIONS.tutorials,
    title: 'Tutorials',
    more: 'Mehr',
  },
  ask: 'Fragen',
};

const PT_TRANSLATIONS: WorkbenchContent = {
  ...ES_TRANSLATIONS,
  topBar: {
    home: 'Início',
    workspaceDesc: 'Autonomous Systems Workspace',
    myTeam: 'Minha Equipe',
    free: 'Grátis',
    support: 'Suporte e Contato',
    lightMode: 'Modo Claro',
    darkMode: 'Modo Escuro',
  },
  sidebar: {
    creative: 'Criativo',
    developer: 'Desenvolvedor',
    upgradeTitle: 'ATUALIZAR PARA...',
    upgradeSubtitle: 'Ver Planos e Preços',
    socialMedia: 'Redes Sociais',
    caseStudies: 'Casos de Estudo',
    aboutFounder: 'Sobre o Fundador',
    contactUs: 'Contato',
  },
  production: {
    imageAndVideo: {
      title: 'Imagem e vídeo',
      desc: 'Gere imagens e vídeos e sincronize os lábios com IA',
      badge: 'Novo',
    },
    textToSpeech: {
      title: 'Texto para Fala',
      desc: 'Converta qualquer texto em voz natural em segundos',
    },
    createVoice: {
      title: 'Criar voz',
      desc: 'Crie uma cópia digital de qualquer voz com nossa IA neural',
    },
    agent: {
      title: 'Agente',
      desc: 'Crie e integre no seu site um atendimento por voz com IA em tempo real',
      badge: 'Novo',
    },
  },
  subTools: {
    storyStudio: 'Estúdio de Histórias',
    audioSeparation: 'Separação de Áudio',
    speechToText: 'Conversão de voz em texto',
    voiceChanger: 'Modificador de voz',
    soundEffect: 'Efeitos sonoros',
  },
  newsBanner: {
    title: 'Fish Audio MCP: grande melhoria',
    subtitle: 'Agora também gera imagens e vídeos com fluxos autônomos.',
    buttonText: 'Conectar agora',
  },
  projects: {
    title: 'Projetos',
    emptyTitle: 'Comece sua jornada de criação de áudio',
    emptyDesc: 'O Story Studio permite combinar texto, áudio e efeitos em uma linha do tempo multipista.',
    buttonText: 'Criar um novo projeto de estúdio',
  },
  generationHistory: {
    title: 'Histórico de geração',
    more: 'Mais',
    assistantName: 'Assistente Robótico Clássico',
    sampleText: 'Sou seu assistente digital. Estou aqui para processar suas informações e responder com precisão.',
    play: 'Reproduzir',
    download: 'Baixar',
    share: 'Compartilhar',
  },
  myVoiceLibrary: {
    title: 'Biblioteca My Voice',
    more: 'Mais',
    componentsTitle: 'Biblioteca de Componentes & Templates',
    componentsDesc: '12 modelos de alta performance e arquitetura moderna',
    knowledgeTitle: 'Knowledge Library (Livros Curados)',
    knowledgeDesc: 'Engenharia de software, automação e escala',
  },
  tutorials: {
    ...ES_TRANSLATIONS.tutorials,
    title: 'Tutoriais',
    more: 'Mais',
  },
  ask: 'Perguntar',
};

export function getWorkbenchTranslations(lang: Language): WorkbenchContent {
  switch (lang) {
    case 'es':
      return ES_TRANSLATIONS;
    case 'en':
      return EN_TRANSLATIONS;
    case 'fr':
      return FR_TRANSLATIONS;
    case 'zh':
      return ZH_TRANSLATIONS;
    case 'de':
      return DE_TRANSLATIONS;
    case 'pt':
      return PT_TRANSLATIONS;
    default:
      // For any other language (it, ru, ja, he, el, qu, ay), use localized translations if possible or fall back cleanly
      return (lang as string) === 'qu' || (lang as string) === 'ay' ? ES_TRANSLATIONS : EN_TRANSLATIONS;
  }
}
