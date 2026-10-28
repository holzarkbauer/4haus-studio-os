const baseTranslations = {
  en: {
    nav: {
      services: "Services",
      resources: "Resource Hub",
      process: "Process",
      results: "Results",
      about: "About",
      faq: "FAQ",
      cta: "Schedule a Call",
    },
    hero: {
      kicker: "AI AUTOMATION & SYSTEM STUDIO",
      headlineLine1: "AI Systems That Sell",
      headlineLine2: "& Operate For You",
      subheadline: "We automate your lead capture, qualification, and follow-ups so you never lose a paying client due to slow response times.",
      ctaPrimary: "Explore Now",
      ctaSecondary: "Play the video",
      scheduleNow: "Schedule now",
      badge1Title: "Excellence",
      badge1Text: "Striving for exceptional quality in every autonomous system.",
      badge2Title: "Sustainable",
      badge2Text: "Promoting frictionless scale and zero-leak automation.",
      showcaseLabel: "PRODUCTION SHOWCASE",
      viewProject: "Launch Live Demo",
      visitSite: "Visit amooo-tienda.ai.studio",
    },
    problem: {
      tag: "THE COST OF HUMAN DELAY",
      headline: "What slow follow-ups are silently costing your company",
      subheadline: "You don't have a lead generation problem. You have a response speed and manual follow-up bottleneck.",
      bullet1Title: "The 5-Minute Cliff",
      bullet1Text: "78% of inbound buyers buy from the vendor that answers first. After 5 minutes, conversion odds drop by 400%. Your human team cannot sit on WhatsApp 24/7.",
      bullet2Title: "The High-Cost Busywork Trap",
      bullet2Text: "Your highest-paid sales talent spends 15+ hours weekly manually qualifying bad fits, copy-pasting numbers into CRMs, and chasing no-shows.",
      bullet3Title: "The Weekend Revenue Blackout",
      bullet3Text: "Leads arriving on Friday evening or Sunday afternoon sit unanswered until Monday. By the time someone replies, the client has already signed with your competitor.",
    },
    services: {
      tag: "CORE SYSTEM CAPABILITIES",
      headline: "Four production engines built to scale your revenue",
      subheadline: "We are not a social media agency or slide-deck consultants. We are technical system builders who engineer, integrate, and deploy working AI machines.",
      items: [
        {
          id: "leads",
          tag: "ENGINE 01",
          title: "AI Lead Capture & Qualification",
          description: "Autonomous WhatsApp, email, and CRM agents that engage inbound inquiries in seconds, filter qualified buyers, and book directly onto your calendar.",
          result: "Tangible Outcome: Zero lost leads. Instant qualification under 60 seconds, 24/7.",
          points: ["WhatsApp Business API official integration", "Custom qualification logic based on your ICP", "Auto-sync to HubSpot, Close, or Google Sheets"]
        },
        {
          id: "funnels",
          tag: "ENGINE 02",
          title: "High-Performance Sites & Funnels",
          description: "Ultra-fast, cinematic digital platforms built on modern React or Webflow, engineered 100% for conversion without generic agency fluff.",
          result: "Tangible Outcome: Sub-second load times, Apple-grade aesthetics, and high visitor-to-lead conversion.",
          points: ["Custom coded with React, Vite & Tailwind", "Zero bloated plugins or slow templates", "Built-in analytics & conversion tracking"]
        },
        {
          id: "ops",
          tag: "ENGINE 03",
          title: "Operational AI Automation",
          description: "Robust end-to-end backend workflows using n8n, Claude, and GPT that eliminate manual data transfers, automated reporting, and customer routing.",
          result: "Tangible Outcome: Reclaim 15-20 hours of manual repetitive labor per operator each week.",
          points: ["Custom n8n workflows hosted privately", "Intelligent document parsing & synthesis", "Real-time alerts via Slack or WhatsApp"]
        },
        {
          id: "brand",
          tag: "ENGINE 04",
          title: "Personal Brand & Digital Products",
          description: "End-to-end knowledge monetization systems for founders and creators based on the CLARITY / RPM framework.",
          result: "Tangible Outcome: Turn founder expertise into evergreen digital assets and automated client acquisition.",
          points: ["CLARITY / RPM curriculum architecture", "Automated delivery funnels & checkout", "High-ticket positioning strategy"]
        }
      ]
    },
    hub: {
      tag: "GROWTH RESOURCES",
      headline: "Practical resources to scale your business",
      subheadline: "4haus is built as an active resource center. Even if you're not ready to hire our technical studio today, gain immediate unfair advantages right here.",
      comingSoon: "Coming Soon",
      active: "Active Now",
      newsletter: {
        title: "Weekly Newsletter",
        description: "Short, actionable tactical playbooks on AI and operational automation for founders, delivered directly to your inbox.",
        placeholder: "Enter your work email...",
        button: "Join Waitlist",
        success: "You're on the list! We'll notify you as soon as edition #01 drops.",
      },
      youtube: {
        title: "Videos & Tutorials",
        description: "Real case studies, live automation builds, n8n breakdowns, and behind-the-scenes system engineering.",
        cta: "Visit YouTube Channel",
        channelName: "@savedtheday",
      },
      tools: {
        title: "Web Development, Systems & AI Agents",
        description: "Our core active offering: custom web engineering, autonomous agents, and revenue workflows tailored to your operation.",
        cta: "Explore AMOOO Live Build",
        ctaSchedule: "Book a Strategy Call",
      },
      infoproducts: {
        title: "Free Guides & Courses",
        description: "Actionable frameworks, blueprints, and downloadable playbooks based on the proven CLARITY / RPM methodology.",
        hotmartText: "Hotmart Portal (Placeholder)",
        clickbankText: "ClickBank Store (Placeholder)",
        notifyBtn: "Notify on Release",
      },
      crowdfunding: {
        title: "Back Our Next Product",
        description: "Support or pre-order the next public software tool and open-source automation modules engineered by 4haus in public.",
        cta: "Notify Me When Live",
      },
      incubator: {
        title: "Founder Incubator",
        description: "Intensive cohort for high-agency entrepreneurs looking to build and deploy their proprietary AI operating system.",
        cta: "Apply for Early Cohort",
      },
      daniel: {
        badge: "FLAGSHIP AI AGENT",
        title: "Meet Daniel",
        description: "Your executive AI second brain. Organizes operations, strategic decisions, and knowledge repositories like a private Jarvis.",
        cta: "Talk to Daniel (Pre-release)",
        modalTitle: "Daniel — Your AI Second Brain",
        modalText: "Daniel is currently in final staging with custom vector memory and agentic orchestration. The production interface will launch soon.",
        status: "Staging Pipeline [[URL PENDIENTE — Launching Q3]]"
      },
      musicbox: {
        title: "MusicBox — Golden Records",
        description: "A built-in audiophile sanctuary. Enjoy curated classic masterpieces through the decades: 40s, 50s, 60s, 70s, 80s, 90s, and 2000s.",
        cta: "Launch MusicBox Player",
      },
      books: {
        title: "Books & Architecture Library",
        description: "Curated foundational reading on systems design, mental models, autonomous pipelines, and leverage for modern founders.",
        cta: "View Recommended Books",
      },
      background: {
        title: "Wallpapers & Themes",
        description: "Customize 4haus.us ambient environment with Apple iOS beach waves, alpine ridges, and obsidian studio themes.",
        cta: "Change Background Theme",
      },
      calculator: {
        title: "ROI & Efficiency Calculator",
        description: "Calculate hours saved weekly and revenue recovered when replacing manual lead delays with 4haus <60s automations.",
        cta: "Open ROI Calculator",
      },
      clock: {
        title: "World Clock & Speed Benchmark",
        description: "Real-time global clocks and live stopwatch testing human vs. 4haus autonomous lead response latency.",
        cta: "Launch Clock & Speed Meter",
      },
      haustore: {
        title: "4haustore App Store",
        description: "Catalog of production blueprints, n8n webhook automations, and e-commerce templates ready to install.",
        cta: "Open 4haustore",
      }
    },
    process: {
      tag: "HOW WE WORK",
      headline: "From diagnosis to autonomous execution in 4 steps",
      subheadline: "We cut through months of theoretical agency slide decks. We execute with engineering rigor and speed.",
      steps: [
        {
          number: "01",
          title: "Diagnostic & Systems Audit",
          desc: "We analyze your current lead flow, response velocity, and operational bottlenecks. We identify where revenue is leaking."
        },
        {
          number: "02",
          title: "Architecture & Flow Design",
          desc: "We map out the exact logic: triggers, qualification questions, AI prompt boundaries, CRM schema, and escalation paths."
        },
        {
          number: "03",
          title: "Rapid Build & Integration",
          desc: "We code and configure the workflows in n8n, connect official WhatsApp APIs, sync your database, and stress-test every edge case."
        },
        {
          number: "04",
          title: "Continuous Optimization",
          desc: "We monitor execution logs, refine conversational prompts with real customer interactions, and expand system throughput."
        }
      ]
    },
    results: {
      tag: "PROVEN IMPACT",
      headline: "Engineered for tangible business outcomes",
      subheadline: "Real systems built for real operators. Here is what happens when speed replaces friction.",
      stat1Number: "< 60s",
      stat1Label: "Inbound Lead Response Time",
      stat1Desc: "Down from industry average of 4.2 hours",
      stat2Number: "+40%",
      stat2Label: "Increase in Lead-to-Call Rate",
      stat2Desc: "Fast qualification prevents customer drop-off",
      stat3Number: "15+ hrs",
      stat3Label: "Saved Per Week Per Operator",
      stat3Desc: "Manual CRM copying and follow-ups eliminated",
      stat4Number: "99.9%",
      stat4Label: "Workflow Execution Uptime",
      stat4Desc: "Automations run uninterrupted 24/7",
      testimonialQuote: "\"José did a great job. Launching our website was so easy thanks to him. The design fits our brand perfectly and the process was clear from start to finish.\"",
      testimonialAuthor: "Melissa",
      testimonialRole: "Owner, AMOOO",
      livePreviewLabel: "Inspect Live Case Study",
      previewBtn: "View amooo-tienda.ai.studio",
      disclaimer: "[[PENDIENTE: Cifras de métricas adicionales se actualizarán con los últimos registros de telemetría de clientes.]]"
    },
    about: {
      tag: "THE BUILDER",
      headline: "Built by an architect turned systems engineer",
      bio1: "Hi, I'm José Trujillo. With a background spanning architectural spatial design, e-commerce web systems, and real estate enterprises, I view digital businesses through the lens of structural engineering.",
      bio2: "Most businesses don't fail from lack of ambition—they fail from structural friction. Unanswered inquiries, fragmented tools, and manual busywork waste the precious momentum founders generate.",
      bio3: "4haus is not an agency that posts on social media for likes. We are technical system builders. We design, code, and integrate autonomous AI infrastructure so your company sells and operates with flawless consistency.",
      pills: [
        "Architectural System Thinking",
        "React & Vite Architecture",
        "n8n AI Orchestration",
        "Official WhatsApp API",
        "Bilingual US / LATAM Market",
        "Conversion-Obsessed"
      ]
    },
    faq: {
      tag: "FREQUENTLY ASKED QUESTIONS",
      headline: "Straight answers for busy decision makers",
      subheadline: "Zero jargon. Everything you need to know about working with 4haus.",
      items: [
        {
          q: "How fast can you deploy our AI automation system?",
          a: "Most core workflows (like WhatsApp lead qualification and CRM synchronization) are designed, built, and launched into production within 10 to 14 business days. High-conversion web builds typically take 2 to 3 weeks."
        },
        {
          q: "Do we need an internal engineering or IT team?",
          a: "No. 4haus handles the entire technical pipeline—from server setup and API authentications to workflow logic and webhook orchestration. Your team only interacts with the final, simple interface (e.g., getting warm calls booked or viewing CRM updates)."
        },
        {
          q: "Will our WhatsApp account get banned or blocked?",
          a: "No. We strictly build using the official Meta WhatsApp Business Cloud API with verified business credentials and rate-limit safeguards. We never use unofficial scrapers or risky gray-hat tools."
        },
        {
          q: "What happens if a lead asks a complex question the AI doesn't know?",
          a: "Every 4haus system has a built-in graceful human escalation fallback. If an inquiry exceeds the AI's confidence threshold or requests a human specialist, the conversation seamlessly hands off to your team with full context."
        },
        {
          q: "How does pricing work?",
          a: "We work on a fixed-scope sprint model for system implementation, followed by optional ongoing optimization and maintenance retainers. You always know the exact deliverables and investment upfront before we write a single line of code."
        },
        {
          q: "What platforms and CRMs can you integrate with?",
          a: "Virtually any modern platform with an API: HubSpot, Close, Salesforce, Google Sheets, Airtable, Notion, Webflow, Shopify, Stripe, Slack, and custom Postgres/SQL databases via n8n."
        }
      ]
    },
    finalCta: {
      kicker: "READY TO STOP LOSING DEALS TO HUMAN DELAY?",
      headline: "Let's engineer your autonomous growth system.",
      subheadline: "Schedule a 20-minute diagnostic session. We will audit your current response bottlenecks and show you the exact blueprint to automate them.",
      primaryBtn: "Book Free Diagnostic Call",
      secondaryBtn: "Chat Directly on WhatsApp",
    },
    footer: {
      tagline: "AI Automation Studio & Growth Resource Hub.",
      allRights: "All rights reserved.",
      navTitle: "Navigation",
      resourcesTitle: "Resource Hub",
      contactTitle: "Direct Contact",
      email: "4hausmaestro@gmail.com",
      whatsappLabel: "WhatsApp Business (+ Direct Chat)",
      youtubeLabel: "YouTube Channel (@savedtheday)",
      disclaimer: "4haus.us is an independent AI systems consultancy and technology studio. Designed with Apple-level minimalist precision."
    },
    bookingModal: {
      title: "Schedule Your System Diagnostic",
      subtitle: "20 minutes. Zero sales pitch. A clear architecture audit of your lead bottlenecks.",
      nameLabel: "Your Name",
      emailLabel: "Business Email",
      companyLabel: "Company / Project",
      bottleneckLabel: "What is your #1 operational or lead bottleneck today?",
      submitBtn: "Confirm Diagnostic Session",
      whatsappOption: "Prefer immediate conversation? Message directly on WhatsApp",
      closeBtn: "Close",
      successMsg: "Diagnostic request registered! José will reach out to you within 4 business hours.",
      openWhatsApp: "Start WhatsApp Chat"
    }
  },
  es: {
    nav: {
      services: "Servicios",
      resources: "Hub de Recursos",
      process: "Proceso",
      results: "Resultados",
      about: "Sobre José",
      faq: "FAQ",
      cta: "Agenda una llamada",
    },
    hero: {
      kicker: "ESTUDIO DE SISTEMAS & AUTOMATIZACIÓN IA",
      headlineLine1: "Sistemas de IA que",
      headlineLine2: "Venden y Operan por Ti",
      subheadline: "Automatizamos la captura, calificación y seguimiento de tus leads para que no pierdas ni un cliente por responder tarde.",
      ctaPrimary: "Explorar Ahora",
      ctaSecondary: "Ver el video",
      scheduleNow: "Agenda llamada",
      badge1Title: "Excelencia",
      badge1Text: "Buscando calidad excepcional en cada sistema autónomo.",
      badge2Title: "Sostenible",
      badge2Text: "Automatización sin fugas para un crecimiento escalable.",
      showcaseLabel: "SISTEMA EN PRODUCCIÓN",
      viewProject: "Ver Demo Interactivo",
      visitSite: "Visitar amooo-tienda.ai.studio",
    },
    problem: {
      tag: "EL COSTO DE NO AUTOMATIZAR",
      headline: "Lo que le cuesta a tu empresa responder tarde",
      subheadline: "No tienes un problema de generación de leads. Tienes un cuello de botella de velocidad de respuesta y seguimiento manual.",
      bullet1Title: "La caída de los 5 minutos",
      bullet1Text: "El 78% de los clientes le compra al primer proveedor que responde. Después de 5 minutos, la probabilidad de conversión cae un 400%. Tu equipo humano no puede estar en WhatsApp 24/7.",
      bullet2Title: "La trampa del trabajo manual repetitivo",
      bullet2Text: "Tus mejores vendedores pierden más de 15 horas a la semana filtrando curiosos, copiando números a hojas de cálculo y persiguiendo citas canceladas.",
      bullet3Title: "El apagón de los fines de semana",
      bullet3Text: "Los leads que llegan un viernes en la noche o un domingo se quedan sin respuesta hasta el lunes. Cuando les escribes, ya cerraron contrato con tu competencia.",
    },
    services: {
      tag: "LÍNEAS DE SERVICIO",
      headline: "Cuatro sistemas diseñados para hacer crecer tu facturación",
      subheadline: "No somos una agencia de posts para redes sociales ni consultores de presentaciones teóricas. Somos constructores técnicos de sistemas que diseñan, integran y entregan máquinas de IA operativas.",
      items: [
        {
          id: "leads",
          tag: "SISTEMA 01",
          title: "Sistemas de generación de leads con IA",
          description: "Automatización de captación, calificación y seguimiento de leads (WhatsApp, email, CRM) para empresas, con foco probado en inmobiliarias y negocios de servicios.",
          result: "Resultado tangible: Cero leads perdidos. Calificación automática en menos de 60 segundos, 24/7.",
          points: ["Integración oficial con API de WhatsApp Business", "Lógica de calificación adaptada a tu cliente ideal (ICP)", "Sincronización instantánea a CRM o Google Sheets"]
        },
        {
          id: "funnels",
          tag: "SISTEMA 02",
          title: "Sitios y funnels de alto rendimiento",
          description: "Diseño y desarrollo web en React y Webflow orientado 100% a conversión, con estética cinematográfica estilo Apple y carga instantánea.",
          result: "Resultado tangible: Tiempos de carga ultra-rápidos y conversión superior de visitante a cliente.",
          points: ["Código a medida en React, Vite y Tailwind", "Sin plantillas lentas ni plugins pesados", "Métricas y eventos de conversión integrados"]
        },
        {
          id: "ops",
          tag: "SISTEMA 03",
          title: "Automatización operativa con IA",
          description: "Flujos de trabajo robustos con n8n + Claude/GPT que reemplazan el trabajo manual repetitivo: respuesta a clientes, reportes diarios y derivación de tareas.",
          result: "Resultado tangible: Ahorra entre 15 y 20 horas semanales de trabajo manual por operador.",
          points: ["Flujos en n8n alojados en servidores seguros", "Procesamiento inteligente de documentos y datos", "Alertas y notificaciones automáticas por WhatsApp o Slack"]
        },
        {
          id: "brand",
          tag: "SISTEMA 04",
          title: "Sistemas de marca personal y producto digital",
          description: "Infraestructura para emprendedores y fundadores que quieren empaquetar, monetizar y vender su propio conocimiento bajo el framework CLARITY / RPM.",
          result: "Resultado tangible: Convierte tu conocimiento en activos digitales recurrentes con ventas automatizadas.",
          points: ["Estructuración metodológica CLARITY / RPM", "Funnels de entrega y pasarelas de pago automatizadas", "Posicionamiento de alto valor para expertos"]
        }
      ]
    },
    hub: {
      tag: "HUB DE RECURSOS",
      headline: "Recursos para hacer crecer tu negocio",
      subheadline: "4haus no es un brochure estático. Es un centro de herramientas prácticas. Aunque aún no estés listo para contratarnos, llévate valor real e inmediato aquí.",
      comingSoon: "Próximamente",
      active: "Activo",
      newsletter: {
        title: "Newsletter semanal",
        description: "Insights cortos y accionables sobre IA y automatización para negocios, directo a tu inbox cada semana.",
        placeholder: "Tu correo de trabajo...",
        button: "Anotarme",
        success: "¡Te has registrado con éxito! Te avisaremos en cuanto salga la primera edición.",
      },
      youtube: {
        title: "Videos y tutoriales",
        description: "Casos reales, tutoriales prácticos de automatización, n8n paso a paso y behind-the-scenes de nuestras implementaciones.",
        cta: "Ver canal de YouTube",
        channelName: "@savedtheday",
      },
      tools: {
        title: "Desarrollo web, sistemas y agentes de IA",
        description: "Nuestra oferta central activa hoy: construcción de sitios web, sistemas de automatización y agentes de IA a medida.",
        cta: "Ver trabajo real (AMOOO)",
        ctaSchedule: "Agendar llamada",
      },
      infoproducts: {
        title: "Guías y cursos",
        description: "Plantillas, guías descargables y cursos basados en nuestro framework de alto impacto CLARITY / RPM.",
        hotmartText: "Tienda Hotmart (Estructura lista)",
        clickbankText: "Catálogo ClickBank (Estructura lista)",
        notifyBtn: "Avísame cuando esté listo",
      },
      crowdfunding: {
        title: "Apoya el próximo producto",
        description: "Invitamos a la comunidad a apoyar o pre-comprar el siguiente producto de software que 4haus construye en público.",
        cta: "Notificarme del lanzamiento",
      },
      incubator: {
        title: "Incubadora de emprendedores",
        description: "Programa para emprendedores que quieren construir y lanzar su propio sistema o producto digital con el método 4haus.",
        cta: "Unirme a la lista de espera",
      },
      daniel: {
        badge: "AGENTE INSIGNIA IA",
        title: "Conoce a Daniel",
        description: "Tu asistente de IA tipo Jarvis y segundo cerebro: organiza procesos, decisiones y productos digitales con contexto total.",
        cta: "Hablar con Daniel (Pre-lanzamiento)",
        modalTitle: "Daniel — Tu Segundo Cerebro con IA",
        modalText: "Daniel se encuentra en fase de pruebas con memoria vectorial avanzada. José activará la interfaz pública antes del lanzamiento oficial.",
        status: "En preparación [[URL PENDIENTE — se agrega antes del lanzamiento]]"
      },
      musicbox: {
        title: "MusicBox — Discos de oro de todos los tiempos",
        description: "Mini reproductor donde escuchas clásicos legendarios por década: 40s, 50s, 60s, 70s, 80s, 90s y 2000s con atmósfera cinematográfica.",
        cta: "Abrir reproductor MusicBox",
      },
      books: {
        title: "Biblioteca de Libros & Arquitectura",
        description: "Lecturas fundamentales seleccionadas sobre diseño de sistemas, apalancamiento, modelos mentales y automatización para fundadores.",
        cta: "Ver Libros Recomendados",
      },
      background: {
        title: "Fondos y Temas de Pantalla",
        description: "Personaliza el ambiente visual de 4haus.us: oleaje cenital de Apple iOS, cumbres alpinas y estudio de obsidiana.",
        cta: "Cambiar Fondo de Pantalla",
      },
      calculator: {
        title: "Calculadora de Retorno (ROI)",
        description: "Calcula horas semanales ahorradas y capital recuperado al reemplazar demoras de leads con automatizaciones de 4haus en <60s.",
        cta: "Abrir Calculadora de ROI",
      },
      clock: {
        title: "Reloj Mundial & Test de Velocidad",
        description: "Husos horarios internacionales y cronómetro en vivo que compara el tiempo de respuesta humano vs. 4haus autónomo.",
        cta: "Abrir Reloj y Cronómetro",
      },
      haustore: {
        title: "4haustore App Store",
        description: "Catálogo de arquitecturas en producción, bots de WhatsApp calificados y plantillas de alta conversión listas para desplegar.",
        cta: "Explorar 4haustore",
      }
    },
    process: {
      tag: "CÓMO TRABAJAMOS",
      headline: "De diagnóstico a ejecución autónoma en 4 pasos",
      subheadline: "Sin meses de presentaciones teóricas. Ejecutamos con velocidad y rigor arquitectónico.",
      steps: [
        {
          number: "01",
          title: "Diagnóstico y auditoría de flujo",
          desc: "Analizamos dónde estás perdiendo clientes por demoras, cómo gestionas tus leads y qué tareas manuales consumen el tiempo de tu equipo."
        },
        {
          number: "02",
          title: "Diseño de la arquitectura del sistema",
          desc: "Definimos los diagramas de flujo, las preguntas de calificación de IA, las reglas de negocio y la integración con tu CRM."
        },
        {
          number: "03",
          title: "Implementación técnica rápida",
          desc: "Construimos los flujos en n8n, conectamos la API oficial de WhatsApp, configuramos bases de datos y probamos cada caso extremo."
        },
        {
          number: "04",
          title: "Optimización y calibración continua",
          desc: "Monitoreamos las conversaciones, refinamos los prompts con datos reales y aseguramos que el sistema opere sin fallas."
        }
      ]
    },
    results: {
      tag: "RESULTADOS Y CASOS REALES",
      headline: "Sistemas medidos por su impacto en caja",
      subheadline: "Resultados concretos de clientes reales. Esto pasa cuando eliminas la fricción de respuesta.",
      stat1Number: "< 60s",
      stat1Label: "Tiempo de respuesta a leads",
      stat1Desc: "Frente al promedio del mercado de más de 4 horas",
      stat2Number: "+40%",
      stat2Label: "Más llamadas de venta agendadas",
      stat2Desc: "La velocidad de contacto evita que el lead busque a otro",
      stat3Number: "15+ hrs",
      stat3Label: "Ahorradas por operador a la semana",
      stat3Desc: "Se elimina el copiado manual y seguimiento rutinario",
      stat4Number: "99.9%",
      stat4Label: "Disponibilidad del sistema",
      stat4Desc: "Automatizaciones activas las 24 horas del día",
      testimonialQuote: "\"José hizo un gran trabajo. El lanzamiento de nuestra página web fue muy sencillo gracias a él. El diseño se adapta a nuestra marca y el proceso fue claro de principio a fin.\"",
      testimonialAuthor: "Melissa",
      testimonialRole: "Owner, AMOOO",
      livePreviewLabel: "Ver Caso Real en Vivo",
      previewBtn: "Explorar amooo-tienda.ai.studio",
      disclaimer: "[[PENDIENTE: métricas adicionales se actualizarán con las telemetrías en curso]]"
    },
    about: {
      tag: "EL FUNDADOR",
      headline: "Arquitectura aplicada a sistemas de negocio",
      bio1: "Hola, soy José Trujillo. Arquitecto y emprendedor con experiencia construyendo múltiples negocios en paralelo: agencias web de alto rendimiento, sistemas de automatización con IA y desarrollos en real estate.",
      bio2: "Los negocios no fallan por falta de ideas, fallan por falta de estructura. Leads sin responder, herramientas desconectadas y tareas manuales frenan el crecimiento que tanto esfuerzo cuesta generar.",
      bio3: "4haus.us no es una agencia de marketing tradicional ni un freelancer de diseño. Somos un 'system builder': diseñamos, construimos e integramos los flujos de IA que hacen que tu empresa venda y opere de forma automática.",
      pills: [
        "Pensamiento Arquitectónico",
        "Stack React & Vite",
        "Orquestación con n8n y LLMs",
        "API Oficial de WhatsApp",
        "Enfoque Bilingüe EE.UU. / LATAM",
        "100% Orientado a Conversión"
      ]
    },
    faq: {
      tag: "PREGUNTAS FRECUENTES",
      headline: "Respuestas claras, sin rodeos técnicos",
      subheadline: "Todo lo que necesitas saber antes de implementar sistemas de IA con 4haus.",
      items: [
        {
          q: "¿Cuánto tiempo toma implementar un sistema de automatización?",
          a: "La mayoría de los sistemas iniciales (como calificación por WhatsApp y sincronización con CRM) se entregan y prueban en producción en 10 a 14 días hábiles. Desarrollos web de alto rendimiento toman entre 2 y 3 semanas."
        },
        {
          q: "¿Necesito un equipo técnico interno para mantenerlo?",
          a: "No. 4haus se encarga de toda la arquitectura, configuración de servidores, credenciales y mantenimiento. Tu equipo solo interactúa con el resultado: llamadas agendadas en tu calendario o leads listos para comprar."
        },
        {
          q: "¿Hay riesgo de que bloqueen mi número de WhatsApp?",
          a: "No. Trabajamos exclusivamente con la API oficial de Meta WhatsApp Cloud a través de socios certificados, con números verificados y respetando todas las políticas comerciales de Meta."
        },
        {
          q: "¿Qué pasa si un cliente hace una pregunta que la IA no sabe responder?",
          a: "El sistema cuenta con un protocolo de derivación humana automática. Si la consulta excede los parámetros definidos o el cliente pide hablar con una persona, la conversación se transfiere a tu equipo con todo el historial."
        },
        {
          q: "¿Cómo se cotiza el servicio?",
          a: "Trabajamos por sprints de implementación con precio cerrado y entregables específicos, con opción de acompañamiento y optimización continua mensual. Sabrás exactamente qué recibirás y cuánto invertirás antes de empezar."
        },
        {
          q: "¿Con qué plataformas y CRMs se puede conectar?",
          a: "Prácticamente con cualquier herramienta moderna: HubSpot, Close, Salesforce, Google Sheets, Airtable, Notion, Webflow, Shopify, Stripe, Slack y bases de datos personalizadas mediante n8n."
        }
      ]
    },
    finalCta: {
      kicker: "¿LISTO PARA DEJAR DE PERDER VENTAS POR RESPONDER TARDE?",
      headline: "Construyamos el sistema que tu negocio necesita.",
      subheadline: "Agenda una sesión de diagnóstico de 20 minutos. Analizaremos tus cuellos de botella actuales y te mostraremos la arquitectura exacta para automatizarlos.",
      primaryBtn: "Agendar llamada de diagnóstico",
      secondaryBtn: "Hablar directo por WhatsApp",
    },
    footer: {
      tagline: "Consultoría de automatización con IA y hub de recursos para empresas.",
      allRights: "Todos los derechos reservados.",
      navTitle: "Navegación",
      resourcesTitle: "Hub de Recursos",
      contactTitle: "Contacto Directo",
      email: "4hausmaestro@gmail.com",
      whatsappLabel: "WhatsApp Business (Chat Directo)",
      youtubeLabel: "Canal de YouTube (@savedtheday)",
      disclaimer: "4haus.us es un estudio independiente de sistemas de automatización con IA. Diseñado con precisión estética y rendimiento técnico."
    },
    bookingModal: {
      title: "Agenda tu Llamada de Diagnóstico",
      subtitle: "20 minutos. Sin ventas agresivas. Una auditoría técnica de tus cuellos de botella.",
      nameLabel: "Tu Nombre",
      emailLabel: "Correo Electrónico de Trabajo",
      companyLabel: "Empresa o Proyecto",
      bottleneckLabel: "¿Cuál es tu principal cuello de botella hoy con tus leads u operaciones?",
      submitBtn: "Confirmar Solicitud de Diagnóstico",
      whatsappOption: "¿Prefieres escribir directo? Contáctanos por WhatsApp",
      closeBtn: "Cerrar",
      successMsg: "¡Solicitud recibida! José se comunicará contigo en menos de 4 horas hábiles.",
      openWhatsApp: "Abrir Chat de WhatsApp"
    }
  }
};

/**
 * Proxy-safe translations dictionary:
 * If an extended language (fr, de, zh, pt, it, ru, ja, he, el, qu, ay, etc.) is accessed,
 * it falls back to 'es' (or 'en' if 'en' is requested)
 * guaranteeing zero undefined runtime errors anywhere in the app.
 */
export const translations: Record<string, typeof baseTranslations.es> = new Proxy(baseTranslations as any, {
  get(target, prop: string) {
    if (prop in target) {
      return target[prop];
    }
    if (prop === 'en') return target.en;
    return target.es;
  }
});

export const getTranslations = (lang: string) => {
  if (lang === 'en') return translations.en;
  return translations.es;
};


