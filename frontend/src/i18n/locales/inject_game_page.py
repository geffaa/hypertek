#!/usr/bin/env python3
"""
Deep-merge complete gamePage translations into game-es.json and game-it.json.
All translations are fully written out — no external API calls required.
"""

import json
import os

LOCALES_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Spanish (es) gamePage
# ---------------------------------------------------------------------------
GAME_PAGE_ES = {
  "gamePage": {
    "welcomeTo": "Bienvenido a",
    "back": "Atrás",
    "racing": {
      "label": "CARRERAS",
      "heading": "Hyper Racing",
      "subtitle": "La experiencia de carreras de vehículos voladores más intensa de la galaxia,\ndonde la habilidad paga y los campeones se forjan.",
      "intro": [
        "Hyper Racing es un juego de carreras competitivo de alto voltaje ambientado en mundos alienígenas, donde los jugadores construyen, mejoran y pilotan vehículos de carreras voladores completamente personalizables a través de algunos de los circuitos más peligrosos de la galaxia. Desde formaciones rocosas flotantes y tubos de lava volcánica hasta desiertos yermos y pasos montañosos, cada carrera es una prueba de preparación, reflejos y estrategia.",
        "Pero Hyper Racing es más que un juego; es una plataforma competitiva donde hay recompensas reales en juego. Los mejores jugadores pueden participar en eventos clasificados y torneos con bolsas de premios en efectivo real. Cuanto mejor corras, más ganas. Ya sea que estés persiguiendo la gloria en los marcadores o construyendo un imperio de carreras, todo lo que haces en Hyper Racing te impulsa hacia adelante.",
        "Mejora tus vehículos de carreras de punta a cola. Recluta y sube de nivel a tu equipo de boxes. Contrata a un director de boxes que se adapte a tu filosofía de carreras. Luego lleva tus habilidades más allá de la pista: tu garaje de carreras también sirve como el hangar de tu nave espacial personal, y cada habilidad que desarrollas se traslada al combate espacial en Hyper Quest y Overlord of the 7 Realms."
      ],
      "introClose": "Sigue leyendo para descubrir cómo funciona el juego, qué puedes ganar y cómo tu carrera de piloto impulsa todo un universo de progresión.",
      "calloutLine1": "Corre para Ganar. Gana para Mejorar.",
      "calloutLine2": "Mejora para Dominar.",
      "howItWorksTitle": "Cómo Funciona Hyper Racing",
      "howItWorks": [
        {
          "num": "01",
          "title": "Elige Tu Vehículo",
          "body": "Cada carrera comienza en tu garaje. Elige entre una creciente selección de vehículos de carreras voladores, cada uno con características únicas de manejo y potencial de mejora. Desnuda un casco para lograr una velocidad en línea recta fulminante o armaló para sobrevivir las condiciones más brutales. Propulsores, estabilizadores, escudos, sistemas de enfriamiento, aletas aerodinámicas: el árbol de mejoras es profundo, y cada modificación cambia el comportamiento de tu nave en la pista."
        },
        {
          "num": "02",
          "title": "Construye Tu Equipo",
          "body": "Las carreras son un deporte de equipo. Recluta especialistas de boxes que aporten bonificaciones únicas: repostaje más rápido, diagnósticos en tiempo real, reparaciones de emergencia del casco a mitad de carrera y ajustes de rendimiento entre vueltas. Cada miembro del equipo sube de nivel con la experiencia, acumulando poderosas habilidades además de las mejoras de tu vehículo. Luego contrata a un director de boxes para coordinar las operaciones, definir la estrategia de carrera y desbloquear potenciadores de rendimiento para todo el equipo que se acumulan a lo largo de una temporada completa."
        },
        {
          "num": "03",
          "title": "Corre por Mundos",
          "body": "Los circuitos abarcan planetas alienígenas con terrenos y peligros atmosféricos radicalmente diferentes. Serpentea entre formaciones rocosas flotantes al estilo Avatar, atraviesa tubos de lava volcánica a velocidad vertiginosa, cruza interminables llanuras desérticas y talla caminos a través de escarpadas cadenas montañosas. Lluvia ácida, atmósferas radiactivas, gravedad variable y vientos turbulentos: ninguna carrera requiere la misma configuración. Ajustar tu vehículo para adaptarse a cada entorno es donde la estrategia se encuentra con la habilidad."
        },
        {
          "num": "04",
          "title": "Escala en los Rangos",
          "body": "La victoria otorga puntos de líder, desbloquea nuevos circuitos en mundos lejanos y abre la puerta a competiciones de mayor nivel. Cuanto más profundo vayas, más feroces serán los oponentes y mayores serán las apuestas. Demuéstrate en todos los planetas y asciende en los rankings globales."
        }
      ],
      "rewardsTitle": "¡Gana a lo Grande; Recompensas que Importan!",
      "rewards": [
        {
          "title": "Recompensas en el Juego",
          "body": "Cada carrera que termines te paga. Gana, y las recompensas se multiplican. Las victorias en las carreras desbloquean componentes premium para vehículos, materiales de mejora raros, tokens exclusivos de reclutamiento de equipo y créditos para financiar tu próxima construcción. Vende vehículos mejorados para obtener beneficios, reinvierte en nuevas máquinas y observa cómo tu imperio de carreras crece con cada llegada al podio."
        },
        {
          "title": "Eventos con Dinero Real",
          "body": "Hyper Racing lleva la competición al siguiente nivel con eventos clasificados y torneos donde el dinero real está en juego. Participa en competiciones basadas en habilidades, demuestra tu capacidad frente a los mejores pilotos de la galaxia y llévate pagos en efectivo real. Cuanto más alto llegues, mayor será la bolsa de premios. Desde desafíos clasificados semanales hasta eventos de campeonato de temporada, siempre hay oportunidades para que los mejores jugadores conviertan sus habilidades de carreras en ganancias reales."
        },
        {
          "title": "Cómo Funcionan los Eventos con Premios",
          "body": "Los jugadores se clasifican mediante el juego clasificado, alcanzando umbrales de rendimiento que les otorgan acceso a torneos con premios en efectivo. Los eventos se estructuran en torno a emparejamientos justos, garantizando que cada competidor se enfrente a oponentes de habilidad similar. Las tarifas de entrada son transparentes, los fondos de premios se muestran claramente antes de comprometerse, y los pagos se procesan rápidamente después de que concluye cada evento. Es competitivo, es justo, y las recompensas son reales."
        },
        {
          "title": "Progresión Más Allá de la Pista",
          "body": "Las recompensas obtenidas en las carreras alimentan directamente tu progresión general. Mejora tus vehículos de carreras, fortalece tu equipo de boxes y canaliza las ganancias hacia la mejora de tu nave espacial principal. Tu garaje de carreras es la bahía de hangar de esa nave, por lo que cada mejora en tu operación de carreras también potencia la nave que vuelas entre mundos y hacia el combate espacial en Hyper Quest y Overlord of the 7 Realms."
        }
      ],
      "upgradesTitle": "Dos Máquinas, Una Misión... Mejora Todo",
      "upgrades": [
        {
          "title": "Mejoras del Vehículo de Carreras",
          "body": "Tu vehículo de carreras es una máquina completamente modular. Cada componente se puede cambiar, ajustar y mejorar: cascos, propulsores, escudos, carcasas externas, motores, estabilizadores, sistemas de enfriamiento y superficies aerodinámicas. Los compuestos ligeros ofrecen velocidad pura; la armadura resistente te mantiene vivo en condiciones atmosféricas brutales. El camino de mejora es profundo, y las elecciones que tomes definen tu identidad de carreras. Compra nuevos vehículos, conviértelos en contendientes de campeonato, llévalos a la victoria y véndelos con ganancias cuando estés listo para el próximo desafío."
        },
        {
          "title": "Mejoras de la Nave Espacial Principal",
          "body": "Tu garaje de carreras no es solo un taller; es la bahía de hangar de tu nave espacial personal. Los mismos recursos, créditos y materiales que ganas en la pista se pueden invertir en la mejora de tu nave principal. Mejores motores para viajes interplanetarios, sistemas de armas más potentes para el combate espacial, navegación mejorada para descubrir nuevos mundos de carreras y cascos reforzados para sobrevivir encuentros hostiles durante el tránsito. Tu nave espacial es tu base de operaciones, tu transporte y tu acorazado, y las carreras la hacen más poderosa."
        },
        {
          "title": "El Ciclo de Mejoras",
          "body": "Corre para ganar. Gana para mejorar. Mejora para ganar carreras más grandes con mayores recompensas. Canaliza esas recompensas tanto en tus vehículos de carreras como en tu nave espacial. Cuanto mejor sea tu nave, más lejos viajarás y más peligrosos y lucrativos serán los circuitos. Es un ciclo de progresión que recompensa la dedicación y la habilidad en cada nivel."
        },
        {
          "title": "Impacto Cruzado en los Juegos",
          "body": "Cada habilidad de piloto que desarrolles en la pista y cada mejora que instales en tu nave espacial se traslada directamente a Hyper Quest y Overlord of the 7 Realms. Un universo, múltiples juegos, progresión perfecta. Lo que construyes en Hyper Racing potencia todo lo demás."
        }
      ],
      "faqTitle": "Hyper Racing — Preguntas Frecuentes",
      "faq": [
        {
          "q": "¿Qué es Hyper Racing?",
          "a": "Un juego de carreras de vehículos voladores de alta intensidad ambientado en mundos alienígenas. Construye, mejora y corre con vehículos totalmente personalizables a través de circuitos de ciencia ficción peligrosos mientras compites por recompensas en el juego y premios en efectivo real."
        },
        {
          "q": "¿Puedo mejorar mi vehículo de carreras?",
          "a": "Cada componente es mejorable: cascos, propulsores, escudos, carcasas externas, motores, estabilizadores, sistemas de enfriamiento y superficies aerodinámicas. Cada mejora cambia cómo se comporta tu vehículo en diferentes pistas y condiciones."
        },
        {
          "q": "¿Qué hace el equipo de boxes?",
          "a": "Los miembros del equipo de boxes proporcionan bonificaciones únicas: repostaje más rápido, diagnósticos del casco, reparaciones de emergencia y ajustes de rendimiento entre vueltas. Suben de nivel con el tiempo, desbloqueando habilidades más potentes que se combinan con las mejoras del vehículo."
        },
        {
          "q": "¿Cómo funciona el director de boxes?",
          "a": "El director de boxes coordina las operaciones del equipo, define la estrategia de carrera y desbloquea potenciadores de rendimiento para todo el equipo. Los directores defensivos protegen tu vehículo en condiciones adversas; los directores agresivos llevan cada sistema al máximo para lograr la velocidad máxima."
        },
        {
          "q": "¿Puedo ganar dinero real?",
          "a": "Sí. Los eventos clasificados y los torneos presentan bolsas de premios en efectivo real. Clasifícate mediante el juego clasificado, compite contra oponentes de habilidad similar y obtén pagos reales según tu posición de llegada. Los desafíos semanales y los campeonatos de temporada se ejecutan continuamente."
        },
        {
          "q": "¿Cómo funcionan las recompensas de las carreras?",
          "a": "Cada carrera paga créditos, materiales de mejora y tokens de equipo. Las victorias multiplican tus ganancias. Compra vehículos, mejóralos en máquinas de carreras, gana carreras y véndelos con ganancias para financiar mejoras adicionales y actualizaciones de la nave espacial."
        },
        {
          "q": "¿También puedo mejorar mi nave espacial principal?",
          "a": "Absolutamente. Tu garaje de carreras es la bahía de hangar de tu nave espacial. Las ganancias en las carreras financian mejoras de motores, armas, navegación y refuerzo del casco en tu nave principal, potenciando los viajes interplanetarios y el combate espacial."
        },
        {
          "q": "¿El progreso se transfiere a otros juegos?",
          "a": "Cada habilidad de piloto y cada mejora de nave espacial se transfieren directamente a Hyper Quest y Overlord of the 7 Realms. Un universo, múltiples juegos, progresión perfecta. Lo que construyes en Hyper Racing potencia todo lo demás."
        },
        {
          "q": "¿Qué entornos de carreras hay?",
          "a": "Los circuitos abarcan formaciones rocosas flotantes, tubos de lava, llanuras desérticas y cordilleras en mundos alienígenas. Los peligros atmosféricos incluyen lluvia ácida, atmósferas radiactivas, gravedad variable y vientos turbulentos. Cada circuito exige configuraciones de vehículos diferentes."
        }
      ]
    },
    "quest": {
      "label": "QUEST",
      "heading": "Hyper Quest",
      "subtitle": "Tu galaxia. Tus reglas. Tu fortuna.",
      "intro": [
        "Hyper Quest es una aventura espacial de mundo abierto donde comandas tu propia nave espacial completamente mejorable, el Quest Racer, a través de una galaxia vasta y peligrosa. Dejaste tu civilización natal hace años en busca de poder, riqueza y fama. Ahora el universo entero es tu patio de juegos, y cada misión que completas te acerca a la dominación galáctica.",
        "Pero Hyper Quest no es solo un juego. Es una plataforma competitiva donde el dinero real está en juego. Completa misiones, conquista desafíos y llévate dinero real en tu bolsillo y/o recompensas. Desde misiones rápidas que toman minutos hasta expediciones épicas de varios días, cada misión paga. Cuanto más difícil sea el desafío, mayor será la recompensa.",
        "Mejora tu nave espacial de casco a cabina. Ármala con devastadores sistemas de armas. Recluta especialistas que acumulan poderosas bonificaciones al rendimiento y nivel de poder de tu nave. Extrae asteroides, transporta carga peligrosa, caza tesoros ocultos, secuestra objetivos de alto valor o conviértete en un pistolero a sueldo. Cómo domines el universo es completamente tu elección.",
        "Todo lo que construyes en Hyper Quest alimenta directamente a Hyper Racing y Overlord of the 7 Realms. Un universo, progresión perfecta, potencial ilimitado. Sigue leyendo para descubrir cómo funciona la exploración, qué puedes ganar y cómo tú y tu nave espacial os convertís en la nave más temida de la galaxia."
      ],
      "calloutLine1": "Explora para Ganar. Gana para Mejorar.",
      "calloutLine2": "Mejora para Conquistar.",
      "howItWorksTitle": "Cómo Funciona Hyper Quest",
      "howItWorks": [
        {
          "num": "01",
          "title": "Acepta Misiones del Tablero de Misiones",
          "body": "El tablero de misiones del juego es tu puerta de entrada a la aventura. Explora las misiones disponibles, desde rápidas entregas de carga que toman solo minutos hasta épicas expediciones de varios días en el espacio no cartografiado. Cada misión incluye objetivos claros, niveles de peligro y niveles de recompensa. Elige las misiones que se adapten a tu estilo de juego, ya sea transportar carga peligrosa, cazar tesoros ocultos, extraer campos de asteroides o ir encubierto para recuperar artefactos perdidos."
        },
        {
          "num": "02",
          "title": "Explora la Galaxia",
          "body": "Viaja a través de portales a planetas lejanos, cada uno con entornos únicos, materiales valiosos y nuevos circuitos de carreras. Sigue mapas galácticos para cartografiar regiones inexploradas y gana derechos de nomenclatura para los planetas que descubras primero. Extrae recursos de campos de asteroides, recupera piezas de reliquias antiguas y naves abandonadas, y reúne pistas que conducen a fortunas ocultas dispersas por las estrellas."
        },
        {
          "num": "03",
          "title": "Construye Tu Imperio Desde Tu Nave",
          "body": "Tu Quest Racer es más que un transporte. Cultiva alimentos en bahías hidropónicas, refina materiales extraídos de planetas lejanos y construye ejércitos desde tus laboratorios de clonación. Refina a tus tropas y sus armas, defiéndete contra los piratas y gestiona una base móvil autosuficiente que se vuelve más poderosa con cada misión que completas."
        },
        {
          "num": "04",
          "title": "Juega a Tu Manera",
          "body": "No hay un único camino hacia la dominación. Conviértete en un temido cazarrecompensas, un astuto contrabandista, un maestro minero o un legendario explorador. Secuestra objetivos de alto valor, conviértete en un pistolero a sueldo o forja alianzas para controlar sectores enteros. La galaxia se doblega a tu voluntad, y cada decisión moldea tu reputación y tu fortuna."
        }
      ],
      "rewardsTitle": "Recompensas de Misiones; ¡Cobra por Jugar!",
      "rewards": [
        {
          "title": "Recompensas en el Juego",
          "body": "Cada misión que completas paga. Créditos, materiales de mejora, componentes raros, tokens de reclutamiento de especialistas y artículos exclusivos fluyen hacia tu inventario con cada misión exitosa. Cuanto más difícil sea la misión, más rica será la cosecha. Descubre materiales raros en planetas lejanos, recupera piezas de alto valor de reliquias antiguas y acumula recursos que impulsan tu ascenso a la supremacía galáctica."
        },
        {
          "title": "Pagos en Efectivo Real",
          "body": "Hyper Quest lleva los juegos más allá del entretenimiento. Ciertas misiones y desafíos clasificados ofrecen pagos en efectivo real. Completa misiones de alto nivel, domina los eventos de clasificación y participa en campeonatos de misiones de temporada donde el dinero real está en juego. Cuanto más hábil y audaz te vuelvas, mayores serán los pagos. Desde recompensas semanales de misiones hasta torneos épicos de temporada, siempre hay oportunidades para convertir tus aventuras galácticas en ganancias reales."
        },
        {
          "title": "Cómo Funcionan los Pagos de Misiones",
          "body": "Los jugadores se califican para misiones con recompensas en efectivo al construir su reputación y alcanzar umbrales de rendimiento. La dificultad de la misión, la duración y el nivel de peligro determinan el fondo de premios. Los pagos son transparentes, claramente mostrados antes de aceptar cualquier misión, y procesados rápidamente tras la finalización. Ya sea que estés haciendo un transporte de carga de diez minutos o una expedición de una semana en el espacio profundo, las recompensas se ajustan al riesgo."
        },
        {
          "title": "Progresión que Paga Hacia el Futuro",
          "body": "Las recompensas de las misiones alimentan directamente las mejoras de tu nave, los sistemas de armas y el reclutamiento de especialistas. Cada pago te hace más fuerte, lo que desbloquea misiones más difíciles con aún mayores recompensas. Las ganancias también se trasladan a Hyper Racing y Overlord of the 7 Realms, creando un ciclo de progresión que recompensa la dedicación en todo el ecosistema Hyper Tek."
        }
      ],
      "upgradesTitle": "Mejora Tu Nave, Arma Tu Arsenal, Recluta Tu Tripulación",
      "upgrades": [
        {
          "title": "Mejoras de la Nave Espacial",
          "body": "Tu Quest Racer es completamente modular, desde la sala de motores hasta la cabina. Mejora el casco para mayor durabilidad, refuerza la carcasa exterior para resistir entornos hostiles, potencia los generadores de escudos para la supervivencia en combate y renueva los sistemas de energía para un rendimiento óptimo. Mejores motores significan viajes interplanetarios más rápidos. Sistemas de navegación más potentes revelan rutas ocultas y mundos no cartografiados. Cada mejora transforma tu nave en un vehículo más poderoso y más temido."
        },
        {
          "title": "Sistemas de Armas",
          "body": "La galaxia es peligrosa, y necesitas ser más peligroso. Mejora y refina tus sistemas de armas para protegerte de piratas, jugadores rivales y fuerzas hostiles. Elige entre configuraciones defensivas que te mantienen con vida en las peores situaciones o cargas ofensivas diseñadas para infligir el máximo daño. Matrices de láser, baterías de misiles, cañones de plasma y armas de energía experimentales están disponibles a medida que avanzas en el árbol de mejoras."
        },
        {
          "title": "Recluta Especialistas",
          "body": "Los especialistas son determinantes. Cada uno aporta habilidades únicas que añaden poderosas bonificaciones al rendimiento general y nivel de poder de tu nave. Los especialistas en navegación revelan caminos ocultos y reducen el tiempo de viaje. Los especialistas en combate aumentan la precisión y el daño de las armas. Los especialistas en ingeniería aumentan la integridad del casco y la velocidad de reparación. Los especialistas en ciencia mejoran la extracción de recursos y el refinamiento de materiales. Combina múltiples especialistas para crear combinaciones devastadoras que multipliquen la efectividad de tu nave."
        },
        {
          "title": "El Ciclo de Poder",
          "body": "Explora para ganar. Gana para mejorar. Mejora para conquistar misiones más difíciles con mayores recompensas. Recluta especialistas para amplificar cada sistema de tu nave. Cuanto más poderoso te vuelvas, más de la galaxia se abrirá y mayor será la fortuna que te espera. Las mejoras de la nave y las bonificaciones de los especialistas también se trasladan directamente al combate espacial durante el tránsito en Hyper Racing y las batallas en Overlord of the 7 Realms."
        }
      ],
      "faqTitle": "Hyper Quest — Preguntas Frecuentes",
      "faq": [
        {
          "q": "¿Qué es Hyper Quest?",
          "a": "Una aventura espacial de mundo abierto donde comandas una nave espacial completamente mejorable a través de una vasta galaxia. Completa misiones, explora mundos alienígenas, mejora tu nave, recluta especialistas y gana recompensas en efectivo real además de riquezas en el juego."
        },
        {
          "q": "¿Cómo funcionan las misiones?",
          "a": "Acepta misiones del tablero de misiones del juego. Las misiones van desde rápidas entregas de carga que toman solo minutos hasta épicas expediciones de varios días en el espacio no cartografiado. Cada misión tiene objetivos claros, niveles de peligro y niveles de recompensa mostrados antes de aceptar."
        },
        {
          "q": "¿Puedo ganar dinero real?",
          "a": "Sí. Ciertas misiones, desafíos clasificados y campeonatos de temporada ofrecen pagos en efectivo real. Construye tu reputación, alcanza umbrales de rendimiento y califica para misiones de recompensa en efectivo cada vez más lucrativas. Las recompensas semanales y los torneos de temporada se ejecutan continuamente."
        },
        {
          "q": "¿Qué recompensas en el juego puedo ganar?",
          "a": "Cada misión completada paga créditos, materiales de mejora, componentes raros, tokens de reclutamiento de especialistas y artículos exclusivos. Cuanto más difícil y larga sea la misión, más ricas serán las recompensas. Descubre materiales raros en planetas lejanos y recupera piezas de alto valor de reliquias antiguas."
        },
        {
          "q": "¿Puedo mejorar mi nave espacial?",
          "a": "Cada sistema es mejorable: casco, carcasa exterior, generadores de escudos, sistemas de energía, motores, cabina y navegación. Mejores motores significan viajes más rápidos, cascos más resistentes sobreviven encuentros hostiles y una navegación mejorada revela rutas ocultas y mundos no cartografiados."
        },
        {
          "q": "¿Qué armas están disponibles?",
          "a": "Mejora y refina sistemas de armas que incluyen matrices de láser, baterías de misiles, cañones de plasma y armas de energía experimentales. Elige configuraciones defensivas para la supervivencia o cargas ofensivas para el máximo daño contra piratas, rivales y fuerzas hostiles."
        },
        {
          "q": "¿Cómo funcionan los especialistas?",
          "a": "Recluta especialistas con habilidades únicas que añaden poderosas bonificaciones al rendimiento y nivel de poder de tu nave. Los especialistas en navegación revelan caminos ocultos, los especialistas en combate aumentan el daño de las armas, los especialistas en ingeniería aumentan la integridad del casco y los especialistas en ciencia mejoran la extracción de recursos. Combina múltiples especialistas para combinaciones devastadoras."
        },
        {
          "q": "¿Qué tipos de misiones están disponibles?",
          "a": "Transporte de carga, minería de asteroides, caza de tesoros, caza de recompensas, recuperación de artefactos, operaciones encubiertas, exploración planetaria, defensa contra piratas, misiones de salvamento y más. Las misiones van desde rápidas carreras de diez minutos hasta expediciones de varios días en el espacio profundo."
        },
        {
          "q": "¿Puedo descubrir nuevos planetas?",
          "a": "Sí. Sigue los mapas galácticos hacia regiones no cartografiadas y descubre nuevos mundos. Los primeros descubridores obtienen derechos de nomenclatura para los planetas que encuentran. Los nuevos mundos ofrecen materiales únicos, entornos y circuitos de carreras a los que ningún otro jugador ha tenido acceso antes."
        },
        {
          "q": "¿Qué puedo hacer dentro de mi nave?",
          "a": "Tu Quest Racer es una base móvil. Cultiva alimentos en bahías hidropónicas, refina materiales extraídos de planetas lejanos, construye y entrena ejércitos en laboratorios de clonación, mejora armas y defensas, y gestiona una operación autosuficiente que se vuelve más poderosa con cada misión."
        },
        {
          "q": "¿Cómo funciona el mapa galáctico?",
          "a": "El mapa galáctico guía tu exploración por el universo. Mejora tu mapa para revelar nuevos sectores, ubicaciones de portales y zonas de misiones ocultas. A medida que explores más lejos, el mapa se expande, desbloqueando regiones del espacio cada vez más peligrosas y gratificantes."
        },
        {
          "q": "¿Mi progreso se transfiere a otros juegos?",
          "a": "Todo lo que construyes en Hyper Quest alimenta directamente a Hyper Racing y Overlord of the 7 Realms. Las mejoras de la nave, las bonificaciones de los especialistas, las habilidades de combate y los recursos se transfieren perfectamente. Un universo, múltiples juegos, progresión ilimitada."
        },
        {
          "q": "¿Puedo jugar como villano?",
          "a": "Absolutamente. Ve encubierto, secuestra objetivos de alto valor, conviértete en un pistolero a sueldo, trafica carga peligrosa o ataca a otros jugadores. No hay un único camino hacia la dominación. Cómo domines la galaxia es completamente tu elección, y cada decisión moldea tu reputación."
        }
      ]
    },
    "overlord": {
      "label": "OVERLORD",
      "heading": "Overlord of the 7 Realms",
      "subtitle": "Aterriza. Reconstruye. Conquista. Conviértete en el Overlord.",
      "intro": [
        "Overlord of the 7 Realms es un juego de estrategia de batalla de tres niveles diferente a cualquier otro en los videojuegos. Te adentraste en un portal hacia un universo paralelo y aterrizaste de emergencia en un planeta alienígena hostil. Tu nave está destrozada, tus sistemas están fallando y las criaturas del planeta ya se están acercando. La supervivencia es solo el comienzo. La dominación es el objetivo.",
        "Reconstruye tu nave desde los escombros. Clona y entrena ejércitos en tus laboratorios a bordo. Doma la fauna del planeta para crear devastada caballería montada. Luego lleva el combate a través de tres dimensiones: combate terrestre contra monstruos y jugadores rivales, asaltos desde tierra al espacio a objetivos orbitales o terrestres, y guerra espacial a bordo del masivo Anillo de Batalla que orbita el planeta.",
        "Este no es solo otro juego de estrategia. Overlord presenta interacción en VR en tiempo real, recompensas en efectivo real por completar eventos y misiones diarias, e invasiones quincenales de los temibles Hammerongs, la especie alienígena más poderosa en existencia. Cada dos semanas llegan para extraer los recursos del planeta, y cada dos semanas los jugadores valientes pueden desafiarlos por enormes bonificaciones y legendarias recompensas.",
        "Mejora tu nave espacial, ármala con devastadoras armas, recluta especialistas que amplíen tu nivel de poder y forja alianzas para controlar regiones enteras. Todo lo que construyes se conecta directamente a Hyper Racing e Hyper Quest a través del ecosistema compartido Hyper Tek. Un universo, tres juegos, guerra ilimitada. Sigue leyendo para descubrir cómo funciona el sistema de batalla y por qué Overlord lo cambia todo."
      ],
      "calloutLine1": "La Supervivencia es Solo el Comienzo.",
      "calloutLine2": "La Dominación es el Objetivo.",
      "howItWorksTitle": "El Sistema de Batalla de Tres Niveles; Tres Dimensiones de Guerra",
      "howItWorks": [
        {
          "num": "01",
          "title": "Combate Terrestre",
          "body": "La superficie del planeta es una zona de guerra. Despliega tus ejércitos clonados contra criaturas alienígenas hostiles, bestias monstruosas y jugadores rivales que luchan por territorio y recursos. Doma y entrena la fauna del planeta para crear unidades de caballería montada que den a tus fuerzas terrestres una ventaja devastadora. La guerra terrestre es cruda, táctica e implacable. Cada batalla que ganes otorga recursos, territorio y reputación."
        },
        {
          "num": "02",
          "title": "Asaltos desde Tierra al Espacio",
          "body": "Aquí es donde Overlord añade una dimensión que ningún, o casi ningún, otro juego ofrece. Crea grupos de tropas especializadas diseñadas para lanzar ataques entre la superficie del planeta y el Anillo de Batalla orbital. Golpea naves estacionadas en el espacio desde tu posición en tierra o coordina asaltos combinados que golpeen a los enemigos desde arriba y abajo simultáneamente. Esta capa de batalla vertical transforma la estrategia estándar en un ajedrez multidimensional donde el posicionamiento tanto en tierra como en el espacio determina la victoria."
        },
        {
          "num": "03",
          "title": "Guerra Espacial",
          "body": "Porta tu nave en órbita y aterriza en el Anillo de Batalla, una masiva estructura orbital que rodea el planeta. Desde aquí, caza naves sin escudo y objetivos vulnerables. Teleporta tropas a través del espacio y directamente a naves enemigas para infligir el máximo daño interno utilizando ataques de abordaje especialmente desarrollados. Las recompensas del combate espacial son de las más altas del juego, y controlar el territorio orbital te da una ventaja estratégica que ningún jugador exclusivamente terrestre puede igualar."
        },
        {
          "num": "04",
          "title": "Por Qué los Tres Niveles lo Cambian Todo",
          "body": "La mayoría de los juegos de estrategia operan en un solo plano. Overlord opera en tres. La capacidad de atacar de tierra a tierra, de tierra a espacio y de espacio a espacio crea un campo de batalla con una profundidad táctica sin igual. La habilidad lo es todo. La fuerza bruta sola no te convertirá en el Overlord. El dominio estratégico en los tres niveles es lo que separa a los dominantes de los derrotados."
        }
      ],
      "extraSection": {
        "title": "El Anillo de Batalla y la Interacción en VR",
        "items": [
          {
            "title": "Aterrizar en el Anillo de Batalla",
            "body": "El Anillo de Batalla es una colosal estructura orbital que rodea el sistema del planeta. Cuando portas tu nave al espacio, puedes atracar en el Anillo de Batalla para obtener una enorme ventaja estratégica. Desde esta posición elevada, puedes cazar naves sin escudo, lanzar partidas de abordaje a naves rivales y coordinar devastadores ataques a objetivos terrestres abajo. Aterrizar en el Anillo de Batalla abre una dimensión de juego completamente nueva que la mayoría de los juegos de estrategia simplemente no ofrecen, dando a Overlord una ventaja táctica sobre cualquier otra cosa en el mercado."
          },
          {
            "title": "Dentro del Anillo de Batalla",
            "body": "El Anillo de Batalla no es solo una plataforma de atraque. Si logras descubrir cómo penetrar en su interior, te esperan misiones ocultas, bonificaciones adicionales y recompensas exclusivas en su interior. El interior del anillo es un laberinto de corredores, cámaras y tecnología antigua. Lleva a cabo misiones y misiones de caza dentro del propio anillo, descubriendo secretos a los que ningún jugador de la superficie jamás accederá. El Anillo de Batalla recompensa a los valientes, los astutos y los implacables."
          },
          {
            "title": "Interacción en VR en Tiempo Real",
            "body": "Como todos los juegos de la gama Hyper Tek, Overlord of the 7 Realms admite interacción VR completa en tiempo real. Entra en tu nave, camina por los corredores del Anillo de Batalla, lidera a tus tropas en el combate terrestre y experimenta la guerra espacial desde la cabina de tu nave. La VR transforma Overlord de un juego de estrategia en una experiencia de campo de batalla totalmente inmersiva. Comanda tus fuerzas, explora terreno alienígena y combate con un nivel de presencia e intensidad que el juego en pantalla plana no puede replicar."
          },
          {
            "title": "La Ventaja Sobre Otros Juegos",
            "body": "Ningún otro juego combina guerra de tres niveles, una estación de batalla orbital explorable, VR en tiempo real y recompensas en efectivo y/o en el juego en una sola experiencia. El Anillo de Batalla por sí solo añade una dimensión de juego que los competidores no pueden igualar. Cuando lo combinas con el combate terrestre, la guerra espacial, la inmersión en VR y el ecosistema interconectado Hyper Tek, Overlord se sitúa en una categoría propia."
          }
        ]
      },
      "upgradesTitle": "Reconstruye, Rearma, Recluta; Potencia tu Máquina de Guerra",
      "upgrades": [
        {
          "title": "Mejoras de la Nave Espacial",
          "body": "Tu nave accidentada es donde todo comienza. Reconstruyela sistema por sistema, desde la sala de motores hasta la cubierta de mando. Cada componente es completamente mejorable: refuerzo del casco, integridad estructural, composición de la carcasa exterior, generadores de escudos, sistemas de energía y matrices de navegación. En Overlord, construyes no para la velocidad sino para la batalla. Un buque de guerra completamente mejorado es la base de cada campaña exitosa, y cuanto más inviertas, más formidable se volverá tu nave."
        },
        {
          "title": "Sistemas de Armas y Niveles Tecnológicos",
          "body": "Mejora y refina tus armas, habilidades y niveles tecnológicos para dominar en los tres niveles de batalla. Artillería terrestre para la guerra planetaria, baterías anti-orbitales para asaltos desde tierra al espacio y matrices de armas montadas en naves para el combate espacial. Cada sistema de armas se puede refinar para roles tácticos específicos. Ya sea que te especialices en bombardeo de largo alcance, acciones de abordaje de corto alcance o contramedidas defensivas, tu carga de armas define tu identidad de combate."
        },
        {
          "title": "Recluta Especialistas",
          "body": "Los especialistas son los multiplicadores de fuerza que separan a los buenos jugadores de los Overlords. Adquiere especialistas únicos que aportan poderosas bonificaciones al rendimiento general y nivel de poder de tu nave. Los especialistas tácticos mejoran la eficiencia del despliegue de tropas, los especialistas en ingeniería aceleran las reparaciones y mejoras de la nave, los especialistas en armas aumentan la producción de daño en todos los sistemas y los especialistas en inteligencia revelan las posiciones y debilidades del enemigo. Combina múltiples especialistas para crear sinergias devastadoras que amplíen cada aspecto de tu operación."
        },
        {
          "title": "Construye Tus Ejércitos",
          "body": "Clona tropas en los laboratorios de clonación a bordo de tu nave, luego mejóralos y refínalos a ellos y sus armas hasta que estén listos para la batalla. Pero las tropas solas no son suficientes. Doma y entrena a las criaturas salvajes del planeta para crear caballería de bestias montadas, una fuerza que no puede ser clonada ni fabricada y que debe ganarse mediante la habilidad y la paciencia. Tu composición de ejército en tierra, aire y espacio es lo que determina tu dominación."
        }
      ],
      "rewardsTitle": "Los Hammerongs, Recompensas y el Ecosistema Hyper Tek",
      "rewards": [
        {
          "title": "Los Hammerongs: La Especie Más Poderosa en Existencia",
          "body": "Cada dos semanas, los campos de fuerza de la arena central caen y los Hammerongs llegan. Son la especie alienígena más fuerte del universo, armada con tecnología avanzada muy por encima de todo lo que poseen los jugadores. Vienen a extraer los recursos del planeta, y defienden la arena con fuerza total y abrumadora. Atacar a los Hammerongs es el desafío más peligroso en Overlord, pero quienes tienen éxito son recompensados con enormes bonificaciones, botín legendario, materiales de mejora raros y recompensas exclusivas que no se pueden obtener de ninguna otra manera. La invasión quincenal de los Hammerongs es la prueba definitiva de tu poder."
        },
        {
          "title": "Eventos Diarios, Misiones y Recompensas de Batalla",
          "body": "Overlord ofrece recompensas constantemente. Completa tareas diarias para ganar créditos, materiales de mejora y bonificaciones de progresión. Participa en eventos especiales para obtener recompensas premium. Lleva a cabo misiones en la superficie del planeta y dentro del Anillo de Batalla para obtener botín exclusivo. Gana batallas contra monstruos, criaturas alienígenas y jugadores rivales para acumular recursos. Explora la superficie para descubrir artefactos y tesoros ocultos. La estructura de recompensas está diseñada para que cada acción que realices te acerque a convertirte en el máximo Overlord del servidor."
        },
        {
          "title": "Conectado al Ecosistema Hyper Tek",
          "body": "Overlord of the 7 Realms no existe de forma aislada. Está completamente integrado en el universo Hyper Tek junto a Hyper Racing e Hyper Quest. Los recursos ganados en Overlord se pueden usar en los tres juegos. Las mejoras de la nave, las bonificaciones de los especialistas, las habilidades de combate y los materiales fluyen perfectamente entre los títulos. Las habilidades de carreras ganadas en Hyper Racing mejoran tus habilidades de piloto en el combate espacial de Overlord. Los materiales recolectados en Hyper Quest impulsan tus mejoras en el planeta. El mercado Hyper Tek conecta todo, creando una economía unificada donde el progreso en un juego impulsa el avance en los tres."
        },
        {
          "title": "Un Universo, Tres Juegos, Poder Ilimitado",
          "body": "Los jugadores que participan en los tres juegos Hyper Tek acumulan poder más rápido, acceden a recompensas exclusivas entre juegos y dominan a través de una amplitud de habilidades y recursos que los jugadores de un solo juego no pueden igualar. El ecosistema interconectado es la ventaja competitiva definitiva."
        }
      ],
      "faqTitle": "Overlord of the 7 Realms — Preguntas Frecuentes",
      "faq": [
        {
          "q": "¿Qué es Overlord of the 7 Realms?",
          "a": "Un juego de estrategia de batalla de tres niveles donde aterrizas de emergencia en un planeta alienígena, reconstruyes tu nave, clonas ejércitos y luchas en tres dimensiones: terrestre, tierra-espacio y espacial. Presenta interacción VR, recompensas en efectivo real e invasiones quincenales de los Hammerongs."
        },
        {
          "q": "¿Qué es el sistema de batalla de tres niveles?",
          "a": "El combate opera en tres niveles: terrestre contra monstruos y jugadores rivales, asaltos tierra-espacio a naves orbitales y guerra espacial en el Anillo de Batalla. Este enfoque multidimensional crea una profundidad táctica que ningún juego de estrategia de un solo plano puede igualar."
        },
        {
          "q": "¿Qué es el Anillo de Batalla?",
          "a": "Una masiva estructura orbital que rodea el planeta. Aterriza tu nave en él para cazar objetivos sin escudo, lanzar partidas de abordaje a naves enemigas y acceder a misiones ocultas dentro de su interior. Controlar el Anillo de Batalla te da una ventaja estratégica sobre los jugadores exclusivamente terrestres."
        },
        {
          "q": "¿Puedo mejorar mi nave espacial?",
          "a": "Cada sistema es mejorable desde la sala de motores hasta la cubierta de mando: casco, estructura, carcasa exterior, generadores de escudos, sistemas de energía y navegación. En Overlord construyes para la batalla, no para la velocidad. Un buque de guerra completamente mejorado es la base de cada campaña."
        },
        {
          "q": "¿Cómo funcionan los especialistas?",
          "a": "Recluta especialistas únicos que añaden poderosas bonificaciones al rendimiento y nivel de poder de tu nave. Los especialistas tácticos, de ingeniería, de armas e inteligencia potencian diferentes sistemas. Combina múltiples especialistas para crear sinergias devastadoras en todos los niveles de batalla."
        },
        {
          "q": "¿Quiénes son los Hammerongs?",
          "a": "La especie alienígena más poderosa en existencia. Cada dos semanas llegan a la arena central para extraer los recursos del planeta, defendidos por fuerza abrumadora y tecnología avanzada. Atacarlos es extremadamente peligroso pero recompensa a los jugadores con enormes bonificaciones y botín legendario."
        },
        {
          "q": "¿Qué recompensas puedo ganar?",
          "a": "Las tareas diarias, misiones, batallas y eventos pagan créditos, materiales de mejora y bonificaciones de progresión. Los eventos especiales y las invasiones de los Hammerongs ofrecen recompensas premium y exclusivas. Los desafíos de mayor dificultad y las competiciones clasificadas ofrecen mayores pagos, incluido dinero real."
        },
        {
          "q": "¿Overlord admite VR?",
          "a": "Sí. La interacción VR completa en tiempo real te permite caminar por los corredores de tu nave, explorar el interior del Anillo de Batalla, liderar tropas en el combate terrestre y pilotar tu nave en la guerra espacial. La VR transforma Overlord de estrategia en una experiencia de campo de batalla completamente inmersiva."
        },
        {
          "q": "¿Cómo construyo mi ejército?",
          "a": "Clona tropas en los laboratorios a bordo de tu nave, luego mejóralos a ellos y sus armas. Para la caballería montada, debes domar y entrenar a las criaturas salvajes del planeta, ya que los animales no pueden ser clonados. La composición del ejército en tierra, aire y espacio determina tu dominación."
        },
        {
          "q": "¿Puedo unirme a una alianza?",
          "a": "Sí. Ve solo o únete a una alianza que aumente tu poder y te ayude a crecer. Las alianzas ofrecen recursos compartidos, ataques coordinados y defensa colectiva. Completa tareas diarias para mejorar tanto tu nave como los activos compartidos de la alianza."
        },
        {
          "q": "¿Overlord está vinculado a otros juegos Hyper Tek?",
          "a": "Completamente integrado. Los recursos, mejoras de naves, bonificaciones de especialistas y habilidades de combate fluyen entre Overlord, Hyper Racing e Hyper Quest. Las habilidades de carreras mejoran tu combate espacial, los materiales de Quest impulsan tus mejoras y el mercado Hyper Tek conecta toda la economía."
        },
        {
          "q": "¿Qué armas están disponibles?",
          "a": "Artillería terrestre, baterías anti-orbitales, matrices de armas montadas en naves y equipo especializado para acciones de abordaje. Cada sistema se puede refinar para roles tácticos específicos, incluido bombardeo de largo alcance, combate de corto alcance y contramedidas defensivas."
        },
        {
          "q": "¿Puedo explorar la superficie del planeta?",
          "a": "Sí. El planeta está lleno de recompensas ocultas, artefactos, recursos y fauna peligrosa para domar. Explora la superficie para encontrar tesoros, batallar contra criaturas alienígenas y monstruos, y descubrir ventajas estratégicas que fortalezcan tu campaña para la dominación de Overlord."
        }
      ]
    }
  }
}

# ---------------------------------------------------------------------------
# Italian (it) gamePage
# ---------------------------------------------------------------------------
GAME_PAGE_IT = {
  "gamePage": {
    "welcomeTo": "Benvenuto su",
    "back": "Indietro",
    "racing": {
      "label": "RACING",
      "heading": "Hyper Racing",
      "subtitle": "L'esperienza di gara con veicoli volanti più intensa della galassia,\ndove l'abilità premia e i campioni vengono forgiati.",
      "intro": [
        "Hyper Racing è un gioco di corse competitive ad alta tensione ambientato in mondi alieni, dove i giocatori costruiscono, potenziano e pilotano veicoli da corsa volanti completamente personalizzabili attraverso alcuni dei circuiti più pericolosi della galassia. Da formazioni rocciose fluttuanti e tubi di lava vulcanica a deserti desolati e valichi di montagna, ogni gara è una prova di preparazione, riflessi e strategia.",
        "Ma Hyper Racing è più di un semplice gioco; è una piattaforma competitiva dove sono in gioco ricompense reali. I migliori giocatori possono partecipare a eventi classificati e tornei con montepremi in denaro reale. Più corri bene, più guadagni. Che tu stia inseguendo la gloria nelle classifiche o costruendo un impero del motorsport, tutto ciò che fai in Hyper Racing ti fa andare avanti.",
        "Potenzia i tuoi veicoli da corsa dal muso alla coda. Recluta e fai salire di livello il tuo team ai box. Assumi un direttore dei box che si adatti alla tua filosofia di gara. Poi porta le tue abilità oltre il circuito: il tuo garage di corse funge anche da hangar della tua nave spaziale personale, e ogni abilità che sviluppi si trasferisce nel combattimento spaziale in Hyper Quest e Overlord of the 7 Realms."
      ],
      "introClose": "Continua a leggere per scoprire come funziona il gioco, cosa puoi vincere e come la tua carriera da pilota alimenta un intero universo di progressione.",
      "calloutLine1": "Corri per Guadagnare. Guadagna per Potenziare.",
      "calloutLine2": "Potenzia per Dominare.",
      "howItWorksTitle": "Come Funziona Hyper Racing",
      "howItWorks": [
        {
          "num": "01",
          "title": "Scegli il Tuo Veicolo",
          "body": "Ogni gara inizia nel tuo garage. Scegli tra una rosa crescente di veicoli da corsa volanti, ognuno con caratteristiche di guida uniche e potenziale di potenziamento. Alleggerisci uno scafo per una velocità in rettilineo bruciante o blindalo per sopravvivere alle condizioni più brutali. Propulsori, stabilizzatori, scudi, sistemi di raffreddamento, alette aerodinamiche: l'albero dei potenziamenti è profondo, e ogni modifica cambia il comportamento del tuo veicolo in pista."
        },
        {
          "num": "02",
          "title": "Costruisci la Tua Squadra",
          "body": "Le corse sono uno sport di squadra. Recluta specialisti dei box che portano bonus unici: rifornimento più veloce, diagnostica in tempo reale, riparazioni di emergenza dello scafo a metà gara e ottimizzazioni delle prestazioni tra un giro e l'altro. Ogni membro del team sale di livello con l'esperienza, accumulando potenti abilità in aggiunta ai potenziamenti del veicolo. Poi assumi un direttore dei box per coordinare le operazioni, definire la strategia di gara e sbloccare bonus di prestazione per l'intero team che si accumulano nel corso di una stagione completa."
        },
        {
          "num": "03",
          "title": "Gareggia Attraverso i Mondi",
          "body": "I circuiti si estendono su pianeti alieni con terreni e pericoli atmosferici radicalmente diversi. Slalom tra formazioni rocciose fluttuanti in stile Avatar, percorri tubi di lava vulcanica a velocità vertiginosa, sfreccia attraverso infinite pianure desertiche e taglia tortuose catene montuose. Pioggia acida, atmosfere radioattive, gravità variabile e venti turbolenti: nessuna gara richiede la stessa configurazione. Mettere a punto il veicolo per adattarsi a ogni ambiente è dove la strategia incontra l'abilità."
        },
        {
          "num": "04",
          "title": "Scala le Classifiche",
          "body": "La vittoria guadagna punti leader, sblocca nuovi circuiti su mondi lontani e apre la porta a competizioni di livello superiore. Più a fondo vai, più feroci sono gli avversari e più alte sono le puntate. Dimostra te stesso su ogni pianeta e ascendi nelle classifiche globali."
        }
      ],
      "rewardsTitle": "Vinci in Grande; Ricompense che Contano!",
      "rewards": [
        {
          "title": "Ricompense nel Gioco",
          "body": "Ogni gara che concludi ti ricompensa. Vinci, e le ricompense si moltiplicano. Le vittorie in gara sbloccano componenti premium per i veicoli, materiali di potenziamento rari, token esclusivi di reclutamento del team e crediti per finanziare la tua prossima costruzione. Vendi veicoli potenziati per profitto, reinvesti in nuove macchine e guarda il tuo impero delle corse crescere con ogni podio."
        },
        {
          "title": "Eventi con Denaro Reale",
          "body": "Hyper Racing porta la competizione al livello successivo con eventi classificati e tornei dove è in gioco denaro reale. Partecipa a competizioni basate sulle abilità, dimostra la tua capacità contro i migliori piloti della galassia e porta a casa pagamenti in denaro reale. Più in alto ti classifichi, più grande è il montepremi. Dalle sfide classificate settimanali agli eventi del campionato stagionale, ci sono sempre opportunità per i migliori giocatori di trasformare le loro abilità di corsa in guadagni reali."
        },
        {
          "title": "Come Funzionano gli Eventi con Premi",
          "body": "I giocatori si qualificano attraverso il gioco classificato, raggiungendo soglie di prestazione che garantiscono l'accesso ai tornei con premi in denaro. Gli eventi sono strutturati attorno a un matchmaking equo, assicurando che ogni concorrente affronti avversari di abilità simile. Le quote di iscrizione sono trasparenti, i montepremi vengono visualizzati chiaramente prima di impegnarsi, e i pagamenti vengono elaborati rapidamente dopo la conclusione di ogni evento. È competitivo, è equo, e le ricompense sono reali."
        },
        {
          "title": "Progressione Oltre il Circuito",
          "body": "Le ricompense guadagnate in gara alimentano direttamente la tua progressione più ampia. Potenzia i tuoi veicoli da corsa, rafforza il tuo team ai box e incanalizza le vincite nel potenziamento della tua nave spaziale principale. Il tuo garage di corse è la baia hangar di quella nave, quindi ogni miglioramento alla tua operazione di corse potenzia anche il veicolo con cui voli tra i mondi e nel combattimento spaziale in Hyper Quest e Overlord of the 7 Realms."
        }
      ],
      "upgradesTitle": "Due Macchine, Una Missione... Potenzia Tutto",
      "upgrades": [
        {
          "title": "Potenziamenti del Veicolo da Corsa",
          "body": "Il tuo veicolo da corsa è una macchina completamente modulare. Ogni componente può essere sostituito, ottimizzato e potenziato: scafi, propulsori, scudi, gusci esterni, motori, stabilizzatori, sistemi di raffreddamento e superfici aerodinamiche. I compositi leggeri offrono velocità pura; l'armatura resistente ti mantiene in vita attraverso condizioni atmosferiche brutali. Il percorso di potenziamento è profondo, e le scelte che fai definiscono la tua identità da corridore. Acquista nuovi veicoli, trasformali in contendenti al campionato, portali alla vittoria e vendili con profitto quando sei pronto per la prossima sfida."
        },
        {
          "title": "Potenziamenti della Nave Spaziale Principale",
          "body": "Il tuo garage di corse non è solo un'officina; è la baia hangar della tua nave spaziale personale. Le stesse risorse, crediti e materiali che guadagni in pista possono essere investiti nel potenziamento della tua nave principale. Motori migliori per i viaggi interplanetari, sistemi d'arma più potenti per il combattimento spaziale, navigazione migliorata per scoprire nuovi mondi da corsa e scafi rinforzati per sopravvivere a incontri ostili durante il transito. La tua nave spaziale è la tua base operativa, il tuo mezzo di trasporto e la tua corazzata, e le corse la rendono più forte."
        },
        {
          "title": "Il Ciclo dei Potenziamenti",
          "body": "Corri per guadagnare. Guadagna per potenziare. Potenzia per vincere gare più grandi con ricompense maggiori. Canalizza quelle ricompense sia nei tuoi veicoli da corsa che nella tua nave spaziale. Migliore è la tua nave, più lontano viaggi e più pericolosi e redditizi diventano i circuiti. È un ciclo di progressione che premia la dedizione e l'abilità a ogni livello."
        },
        {
          "title": "Impatto Cross-Game",
          "body": "Ogni abilità da pilota che sviluppi in pista e ogni potenziamento che installi sulla tua nave spaziale si trasferisce direttamente in Hyper Quest e Overlord of the 7 Realms. Un universo, più giochi, progressione senza soluzione di continuità. Ciò che costruisci in Hyper Racing potenzia tutto il resto."
        }
      ],
      "faqTitle": "Hyper Racing — Domande Frequenti",
      "faq": [
        {
          "q": "Cos'è Hyper Racing?",
          "a": "Un gioco di corse con veicoli volanti ad alta intensità ambientato in mondi alieni. Costruisci, potenzia e gareggia con veicoli completamente personalizzabili attraverso circuiti di fantascienza pericolosi mentre competi per ricompense nel gioco e premi in denaro reale."
        },
        {
          "q": "Posso potenziare il mio veicolo da corsa?",
          "a": "Ogni componente è potenziabile: scafi, propulsori, scudi, gusci esterni, motori, stabilizzatori, sistemi di raffreddamento e superfici aerodinamiche. Ogni potenziamento cambia il comportamento del veicolo su piste e condizioni diverse."
        },
        {
          "q": "Cosa fa il team ai box?",
          "a": "I membri del team ai box forniscono bonus unici: rifornimento più veloce, diagnostica dello scafo, riparazioni di emergenza e ottimizzazioni delle prestazioni tra i giri. Salgono di livello nel tempo, sbloccando abilità più potenti che si combinano con i potenziamenti del veicolo."
        },
        {
          "q": "Come funziona il direttore dei box?",
          "a": "Il direttore dei box coordina le operazioni del team, definisce la strategia di gara e sblocca bonus di prestazione per l'intero team. I direttori difensivi proteggono il veicolo in condizioni difficili; i direttori aggressivi spingono ogni sistema al massimo per la velocità massima."
        },
        {
          "q": "Posso vincere denaro reale?",
          "a": "Sì. Gli eventi classificati e i tornei presentano montepremi in denaro reale. Qualificati attraverso il gioco classificato, competiti contro avversari di abilità simile e guadagna pagamenti reali in base alla tua posizione finale. Le sfide settimanali e i campionati stagionali si svolgono continuamente."
        },
        {
          "q": "Come funzionano le ricompense delle gare?",
          "a": "Ogni gara paga crediti, materiali di potenziamento e token del team. Le vittorie moltiplicano i tuoi guadagni. Acquista veicoli, potenziali in macchine da corsa, vinci gare e vendili con profitto per finanziare ulteriori miglioramenti e potenziamenti della nave spaziale."
        },
        {
          "q": "Posso anche potenziare la mia nave spaziale principale?",
          "a": "Assolutamente. Il tuo garage di corse è la baia hangar della tua nave spaziale. Le vincite di gara finanziano i potenziamenti di motori, armi, navigazione e rinforzo dello scafo sulla tua nave principale, potenziando i viaggi interplanetari e il combattimento spaziale."
        },
        {
          "q": "I progressi si trasferiscono ad altri giochi?",
          "a": "Ogni abilità da pilota e ogni potenziamento della nave spaziale si trasferiscono direttamente in Hyper Quest e Overlord of the 7 Realms. Un universo, più giochi, progressione senza soluzione di continuità. Ciò che costruisci in Hyper Racing potenzia tutto il resto."
        },
        {
          "q": "Quali ambienti di gara ci sono?",
          "a": "I circuiti si estendono su formazioni rocciose fluttuanti, tubi di lava, pianure desertiche e catene montuose su mondi alieni. I pericoli atmosferici includono pioggia acida, atmosfere radioattive, gravità variabile e venti turbolenti. Ogni circuito richiede configurazioni di veicoli diverse."
        }
      ]
    },
    "quest": {
      "label": "QUEST",
      "heading": "Hyper Quest",
      "subtitle": "La tua galassia. Le tue regole. La tua fortuna.",
      "intro": [
        "Hyper Quest è un'avventura spaziale open-world dove comandi la tua nave spaziale completamente potenziabile, il Quest Racer, attraverso una galassia vasta e pericolosa. Hai lasciato la tua civiltà natale anni fa in cerca di potere, ricchezza e fama. Ora l'intero universo è il tuo parco giochi, e ogni missione che completi ti avvicina alla dominazione galattica.",
        "Ma Hyper Quest non è solo un gioco. È una piattaforma competitiva dove è in gioco denaro reale. Completa missioni, conquista sfide e portati a casa denaro reale in tasca e/o ricompense. Dalle missioni veloci che richiedono minuti alle epiche spedizioni multi-giorno, ogni missione paga. Più difficile è la sfida, maggiore è la ricompensa.",
        "Potenzia la tua nave spaziale dallo scafo alla cabina. Armala con devastanti sistemi d'arma. Recluta specialisti che accumulano potenti bonus alle prestazioni e al livello di potenza della tua nave. Estrai asteroidi, trasporta carichi pericolosi, caccia tesori nascosti, rapisce obiettivi di alto valore o diventa un pistolero mercenario. Come regni l'universo è interamente la tua scelta.",
        "Tutto ciò che costruisci in Hyper Quest alimenta direttamente Hyper Racing e Overlord of the 7 Realms. Un universo, progressione senza soluzione di continuità, potenziale illimitato. Continua a leggere per scoprire come funziona l'esplorazione, cosa puoi guadagnare e come tu e la tua nave spaziale diventate il vascello più temuto della galassia."
      ],
      "calloutLine1": "Esplora per Guadagnare. Guadagna per Potenziare.",
      "calloutLine2": "Potenzia per Conquistare.",
      "howItWorksTitle": "Come Funziona Hyper Quest",
      "howItWorks": [
        {
          "num": "01",
          "title": "Accetta Missioni dalla Bacheca delle Missioni",
          "body": "La bacheca delle missioni nel gioco è il tuo portale verso l'avventura. Sfoglia le missioni disponibili, da rapide consegne di cargo che richiedono solo minuti a epiche spedizioni multi-giorno nelle profondità dello spazio inesplorato. Ogni missione include obiettivi chiari, valutazioni di pericolo e livelli di ricompensa. Scegli le missioni che si adattano al tuo stile di gioco, che si tratti di trasportare cargo pericoloso, cacciare tesori nascosti, estrarre campi di asteroidi o andare sotto copertura per recuperare artefatti perduti."
        },
        {
          "num": "02",
          "title": "Esplora la Galassia",
          "body": "Viaggia attraverso portali verso pianeti lontani, ognuno con ambienti unici, materiali preziosi e nuovi circuiti di gara. Segui le mappe galattiche per cartografare regioni inesplorate e guadagna i diritti di denominazione per i pianeti che scopri per primo. Estrai risorse da campi di asteroidi, recupera parti da antiche reliquie e navi abbandonate, e raccogli indizi che portano a fortune nascoste sparse tra le stelle."
        },
        {
          "num": "03",
          "title": "Costruisci il Tuo Impero dalla Tua Nave",
          "body": "Il tuo Quest Racer è più di un semplice mezzo di trasporto. Coltiva cibo nelle baie idroponiche, raffina materiali estratti da pianeti lontani e costruisci eserciti dai tuoi laboratori di clonazione. Raffina le tue truppe e le loro armi, difenditi dai pirati e gestisci una base mobile autosufficiente che diventa più potente con ogni missione che completi."
        },
        {
          "num": "04",
          "title": "Gioca a Modo Tuo",
          "body": "Non c'è un unico percorso verso la dominazione. Diventa un temuto cacciatore di taglie, un astuto contrabbandiere, un maestro minatore o un leggendario esploratore. Rapisce obiettivi di alto valore, diventa un pistolero mercenario o forgia alleanze per controllare interi settori. La galassia si piega alla tua volontà, e ogni decisione plasma la tua reputazione e la tua fortuna."
        }
      ],
      "rewardsTitle": "Ricompense di Missione; Vieni Pagato per Giocare!",
      "rewards": [
        {
          "title": "Ricompense nel Gioco",
          "body": "Ogni missione che completi ti paga. Crediti, materiali di potenziamento, componenti rari, token di reclutamento di specialisti e oggetti esclusivi affluiscono nel tuo inventario con ogni missione completata con successo. Più difficile è la missione, più ricco è il bottino. Scopri materiali rari su pianeti lontani, recupera parti di alto valore da antiche reliquie e accumula risorse che alimentano la tua ascesa alla supremazia galattica."
        },
        {
          "title": "Pagamenti in Denaro Reale",
          "body": "Hyper Quest porta il gaming oltre l'intrattenimento. Certe missioni e sfide classificate offrono pagamenti in denaro reale. Completa missioni di alto livello, domina gli eventi in classifica e partecipa ai campionati stagionali di missioni dove è in gioco denaro reale. Più abile e audace diventi, maggiori sono i pagamenti. Dalle taglie settimanali di missioni agli epici tornei stagionali, ci sono sempre opportunità per trasformare le tue avventure galattiche in guadagni reali."
        },
        {
          "title": "Come Funzionano i Pagamenti delle Missioni",
          "body": "I giocatori si qualificano per le missioni con ricompense in denaro costruendo la propria reputazione e raggiungendo le soglie di prestazione. La difficoltà della missione, la durata e il livello di pericolo determinano il montepremi. I pagamenti sono trasparenti, chiaramente visualizzati prima di accettare qualsiasi missione, e elaborati rapidamente al completamento. Che tu stia effettuando un trasporto di cargo di dieci minuti o una spedizione di una settimana nello spazio profondo, le ricompense corrispondono al rischio."
        },
        {
          "title": "Progressione che Paga in Avanti",
          "body": "Le ricompense delle missioni alimentano direttamente i potenziamenti della nave, i sistemi d'arma e il reclutamento di specialisti. Ogni pagamento ti rende più forte, il che sblocca missioni più difficili con ricompense ancora maggiori. I guadagni si trasferiscono anche in Hyper Racing e Overlord of the 7 Realms, creando un ciclo di progressione che premia la dedizione nell'intero ecosistema Hyper Tek."
        }
      ],
      "upgradesTitle": "Potenzia la Nave, Arma l'Arsenale, Recluta l'Equipaggio",
      "upgrades": [
        {
          "title": "Potenziamenti della Nave Spaziale",
          "body": "Il tuo Quest Racer è completamente modulare dalla sala motori alla cabina. Potenzia lo scafo per la massima durabilità, rinforza il guscio esterno per resistere agli ambienti ostili, potenzia i generatori di scudi per la sopravvivenza in combattimento e rinnova i sistemi di energia per prestazioni ottimali. Motori migliori significano viaggi interplanetari più veloci. Sistemi di navigazione più potenti rivelano rotte nascoste e mondi inesplorati. Ogni potenziamento trasforma la tua nave in un vascello più potente e più temuto."
        },
        {
          "title": "Sistemi d'Arma",
          "body": "La galassia è pericolosa, e devi essere più pericoloso. Potenzia e raffina i tuoi sistemi d'arma per proteggerti da pirati, giocatori rivali e forze ostili. Scegli tra configurazioni difensive che ti mantengono in vita nelle situazioni peggiori o carichi offensivi progettati per infliggere il massimo danno. Array laser, batterie missilistiche, cannoni al plasma e armi energetiche sperimentali sono tutti disponibili man mano che avanzi nell'albero dei potenziamenti."
        },
        {
          "title": "Recluta Specialisti",
          "body": "Gli specialisti cambiano le regole del gioco. Ognuno porta abilità uniche che aggiungono potenti bonus alle prestazioni complessive e al livello di potenza della nave. Gli specialisti di navigazione rivelano percorsi nascosti e riducono i tempi di viaggio. Gli specialisti di combattimento aumentano la precisione e il danno delle armi. Gli specialisti di ingegneria aumentano l'integrità dello scafo e la velocità di riparazione. Gli specialisti di scienza migliorano l'estrazione di risorse e il raffinamento dei materiali. Combina più specialisti per creare combinazioni devastanti che moltiplicano l'efficacia della tua nave."
        },
        {
          "title": "Il Ciclo di Potenza",
          "body": "Esplora per guadagnare. Guadagna per potenziare. Potenzia per conquistare missioni più difficili con ricompense maggiori. Recluta specialisti per amplificare ogni sistema della tua nave. Più diventi potente, più la galassia si apre e maggiore è la fortuna che ti aspetta. I potenziamenti della nave e i bonus degli specialisti si trasferiscono anche direttamente nel combattimento spaziale durante il transito in Hyper Racing e le battaglie in Overlord of the 7 Realms."
        }
      ],
      "faqTitle": "Hyper Quest — Domande Frequenti",
      "faq": [
        {
          "q": "Cos'è Hyper Quest?",
          "a": "Un'avventura spaziale open-world dove comandi una nave spaziale completamente potenziabile attraverso una vasta galassia. Completa missioni, esplora mondi alieni, potenzia la tua nave, recluta specialisti e guadagna ricompense in denaro reale oltre alle ricchezze nel gioco."
        },
        {
          "q": "Come funzionano le missioni?",
          "a": "Accetta missioni dalla bacheca delle missioni nel gioco. Le missioni vanno da rapide consegne di cargo che richiedono solo minuti a epiche spedizioni multi-giorno nelle profondità dello spazio inesplorato. Ogni missione ha obiettivi chiari, valutazioni di pericolo e livelli di ricompensa visualizzati prima di accettare."
        },
        {
          "q": "Posso guadagnare denaro reale?",
          "a": "Sì. Certe missioni, sfide classificate e campionati stagionali offrono pagamenti in denaro reale. Costruisci la tua reputazione, raggiungi le soglie di prestazione e qualificati per missioni con ricompensa in denaro sempre più redditizie. Le taglie settimanali e i tornei stagionali si svolgono continuamente."
        },
        {
          "q": "Quali ricompense nel gioco posso guadagnare?",
          "a": "Ogni missione completata paga crediti, materiali di potenziamento, componenti rari, token di reclutamento di specialisti e oggetti esclusivi. Più difficile e lunga è la missione, più ricche sono le ricompense. Scopri materiali rari su pianeti lontani e recupera parti di alto valore da antiche reliquie."
        },
        {
          "q": "Posso potenziare la mia nave spaziale?",
          "a": "Ogni sistema è potenziabile: scafo, guscio esterno, generatori di scudi, sistemi di energia, motori, cabina e navigazione. Motori migliori significano viaggi più veloci, scafi più resistenti sopravvivono a incontri ostili e una navigazione potenziata rivela rotte nascoste e mondi inesplorati."
        },
        {
          "q": "Quali armi sono disponibili?",
          "a": "Potenzia e raffina sistemi d'arma tra cui array laser, batterie missilistiche, cannoni al plasma e armi energetiche sperimentali. Scegli configurazioni difensive per la sopravvivenza o carichi offensivi per il massimo danno contro pirati, rivali e forze ostili."
        },
        {
          "q": "Come funzionano gli specialisti?",
          "a": "Recluta specialisti con abilità uniche che aggiungono potenti bonus alle prestazioni e al livello di potenza della nave. Gli specialisti di navigazione rivelano percorsi nascosti, gli specialisti di combattimento aumentano il danno delle armi, gli specialisti di ingegneria aumentano l'integrità dello scafo e gli specialisti di scienza migliorano l'estrazione di risorse. Combina più specialisti per combinazioni devastanti."
        },
        {
          "q": "Quali tipi di missioni sono disponibili?",
          "a": "Trasporto di cargo, estrazione di asteroidi, caccia al tesoro, caccia alle taglie, recupero di artefatti, operazioni sotto copertura, esplorazione planetaria, difesa dai pirati, missioni di salvataggio e altro ancora. Le missioni vanno da rapide corse di dieci minuti a spedizioni multi-giorno nello spazio profondo."
        },
        {
          "q": "Posso scoprire nuovi pianeti?",
          "a": "Sì. Segui le mappe galattiche verso regioni inesplorate e scopri nuovi mondi. I primi esploratori guadagnano i diritti di denominazione per i pianeti che trovano. I nuovi mondi offrono materiali unici, ambienti e circuiti di gara a cui nessun altro giocatore ha ancora avuto accesso."
        },
        {
          "q": "Cosa posso fare all'interno della mia nave?",
          "a": "Il tuo Quest Racer è una base mobile. Coltiva cibo nelle baie idroponiche, raffina materiali estratti da pianeti lontani, costruisci e addestra eserciti nei laboratori di clonazione, potenzia armi e difese, e gestisci un'operazione autosufficiente che diventa più potente con ogni missione."
        },
        {
          "q": "Come funziona la mappa galattica?",
          "a": "La mappa galattica guida la tua esplorazione attraverso l'universo. Potenzia la tua mappa per rivelare nuovi settori, posizioni dei portali e zone di missioni nascoste. Man mano che esplori più lontano, la mappa si espande, sbloccando regioni dello spazio sempre più pericolose e gratificanti."
        },
        {
          "q": "I miei progressi si trasferiscono ad altri giochi?",
          "a": "Tutto ciò che costruisci in Hyper Quest alimenta direttamente Hyper Racing e Overlord of the 7 Realms. I potenziamenti della nave, i bonus degli specialisti, le abilità di combattimento e le risorse si trasferiscono tutti senza soluzione di continuità. Un universo, più giochi, progressione illimitata."
        },
        {
          "q": "Posso giocare come cattivo?",
          "a": "Assolutamente. Vai sotto copertura, rapisce obiettivi di alto valore, diventa un pistolero mercenario, contrabbanda cargo pericoloso o saccheggia altri giocatori. Non c'è un unico percorso verso la dominazione. Come regni la galassia è interamente la tua scelta, e ogni decisione plasma la tua reputazione."
        }
      ]
    },
    "overlord": {
      "label": "OVERLORD",
      "heading": "Overlord of the 7 Realms",
      "subtitle": "Atterraggio di Emergenza. Ricostruisci. Conquista. Diventa l'Overlord.",
      "intro": [
        "Overlord of the 7 Realms è un gioco di strategia di battaglia a tre livelli senza pari nel panorama videoludico. Ti sei avventurato in un portale verso un universo parallelo e sei atterrato d'emergenza su un pianeta alieno ostile. La tua nave è distrutta, i tuoi sistemi stanno cedendo e le creature del pianeta si stanno già avvicinando. La sopravvivenza è solo l'inizio. La dominazione è l'obiettivo.",
        "Ricostruisci la tua nave dai rottami. Clona e addestra eserciti nei laboratori a bordo. Addomestica la fauna del pianeta per creare devastante cavalleria montata. Poi porta la battaglia attraverso tre dimensioni di combattimento: combattimento terra-terra contro mostri e giocatori rivali, assalti terra-spazio a obiettivi orbitali o terrestri, e guerra spazio-spazio a bordo del massiccio Anello di Battaglia che orbita il pianeta.",
        "Questo non è solo un altro gioco di strategia. Overlord presenta interazione VR in tempo reale, ricompense in denaro reale per il completamento di eventi e missioni giornalieri, e invasioni quindicinali dei temibili Hammerongs, la specie aliena più potente in esistenza. Ogni due settimane arrivano per estrarre le risorse del pianeta, e ogni due settimane i giocatori coraggiosi possono sfidarli per enormi bonus e leggendarie ricompense.",
        "Potenzia la tua nave spaziale, armala con armi devastanti, recluta specialisti che amplificano il tuo livello di potenza e forgia alleanze per controllare intere regioni. Tutto ciò che costruisci si connette direttamente a Hyper Racing e Hyper Quest attraverso l'ecosistema condiviso Hyper Tek. Un universo, tre giochi, guerra illimitata. Continua a leggere per scoprire come funziona il sistema di battaglia e perché Overlord cambia tutto."
      ],
      "calloutLine1": "La Sopravvivenza è Solo l'Inizio.",
      "calloutLine2": "La Dominazione è l'Obiettivo.",
      "howItWorksTitle": "Il Sistema di Battaglia a Tre Livelli; Tre Dimensioni di Guerra",
      "howItWorks": [
        {
          "num": "01",
          "title": "Combattimento Terra-Terra",
          "body": "La superficie del pianeta è una zona di guerra. Schiera i tuoi eserciti clonati contro creature aliene ostili, bestie mostruose e giocatori rivali che combattono per territorio e risorse. Addomestica e addestra la fauna del pianeta per creare unità di cavalleria montata che diano alle tue forze terrestri un vantaggio devastante. La guerra terrestre è cruda, tattica e implacabile. Ogni battaglia vinta guadagna risorse, territorio e reputazione."
        },
        {
          "num": "02",
          "title": "Assalti Terra-Spazio",
          "body": "Qui Overlord aggiunge una dimensione che nessun altro, o quasi nessun altro, gioco offre. Crea gruppi di truppe specializzate progettate per lanciare attacchi tra la superficie del pianeta e l'Anello di Battaglia orbital. Colpisci navi stazionate nello spazio dalla tua posizione a terra o coordina assalti combinati che colpiscano i nemici dall'alto e dal basso simultaneamente. Questo livello di battaglia verticale trasforma la strategia standard in una partita a scacchi multidimensionale dove il posizionamento sia a terra che nello spazio determina la vittoria."
        },
        {
          "num": "03",
          "title": "Guerra Spazio-Spazio",
          "body": "Porta la tua nave in orbita e atterra sull'Anello di Battaglia, una massiccia struttura orbitale che circonda il pianeta. Da qui, caccia navi senza scudo e obiettivi vulnerabili. Teleporta truppe attraverso lo spazio e direttamente nelle navi nemiche per infliggere il massimo danno interno utilizzando attacchi di abbordaggio appositamente sviluppati. Le ricompense del combattimento spaziale sono tra le più alte del gioco, e controllare il territorio orbitale ti dà un vantaggio strategico che nessun giocatore esclusivamente terrestre può eguagliare."
        },
        {
          "num": "04",
          "title": "Perché i Tre Livelli Cambiano Tutto",
          "body": "La maggior parte dei giochi di strategia opera su un singolo piano. Overlord opera su tre. La capacità di attaccare da terra a terra, da terra a spazio e da spazio a spazio crea un campo di battaglia con una profondità tattica senza pari. L'abilità è tutto. La sola forza bruta non ti renderà l'Overlord. La padronanza strategica su tutti e tre i livelli è ciò che separa i dominatori dai sconfitti."
        }
      ],
      "extraSection": {
        "title": "L'Anello di Battaglia e l'Interazione VR",
        "items": [
          {
            "title": "Atterrare sull'Anello di Battaglia",
            "body": "L'Anello di Battaglia è una colossale struttura orbitale che circonda il sistema del pianeta. Quando porti la tua nave nello spazio, puoi attraccare sull'Anello di Battaglia per ottenere un enorme vantaggio strategico. Da questa posizione elevata, puoi cacciare navi senza scudo, lanciare partite di abbordaggio nelle navi rivali e coordinare devastanti attacchi sugli obiettivi terrestri sottostanti. Atterrare sull'Anello di Battaglia apre una dimensione di gameplay completamente nuova che la maggior parte dei giochi di strategia semplicemente non offre, dando a Overlord un vantaggio tattico su qualsiasi altro titolo sul mercato."
          },
          {
            "title": "All'Interno dell'Anello di Battaglia",
            "body": "L'Anello di Battaglia non è solo una piattaforma di attracco. Se riesci a scoprire come penetrare nel suo interno, missioni nascoste, bonus aggiuntivi e ricompense esclusive ti attendono all'interno. L'interno dell'anello è un labirinto di corridoi, camere e antica tecnologia. Svolgi missioni e missioni di caccia all'interno dell'anello stesso, scoprendo segreti a cui nessun giocatore legato alla superficie avrà mai accesso. L'Anello di Battaglia premia i coraggiosi, gli astuti e gli implacabili."
          },
          {
            "title": "Interazione VR in Tempo Reale",
            "body": "Come tutti i giochi della gamma Hyper Tek, Overlord of the 7 Realms supporta la piena interazione VR in tempo reale. Entra nella tua nave, percorri i corridoi dell'Anello di Battaglia, guida le tue truppe nel combattimento terrestre e vivi la guerra spaziale dall'abitacolo del tuo veicolo. La VR trasforma Overlord da gioco di strategia in un'esperienza di campo di battaglia completamente immersiva. Comanda le tue forze, esplora terreno alieno e combatti con un livello di presenza e intensità che il gioco su schermo piatto non può replicare."
          },
          {
            "title": "Il Vantaggio sugli Altri Giochi",
            "body": "Nessun altro gioco combina la guerra a tre livelli, una stazione di battaglia orbitale esplorabile, VR in tempo reale e ricompense in denaro reale e/o nel gioco in un'unica esperienza. L'Anello di Battaglia da solo aggiunge una dimensione di gameplay che i concorrenti non possono eguagliare. Quando lo combini con il combattimento terrestre, la guerra spaziale, l'immersione VR e l'ecosistema Hyper Tek interconnesso, Overlord si colloca in una categoria a sé stante."
          }
        ]
      },
      "upgradesTitle": "Ricostruisci, Riarma, Recluta; Potenzia la Tua Macchina da Guerra",
      "upgrades": [
        {
          "title": "Potenziamenti della Nave Spaziale",
          "body": "La tua nave schiantata è dove tutto inizia. Ricostruiscila sistema per sistema, dalla sala motori al ponte di comando. Ogni componente è completamente potenziabile: rinforzo dello scafo, integrità strutturale, composizione del guscio esterno, generatori di scudi, sistemi di energia e array di navigazione. In Overlord, costruisci non per la velocità ma per la battaglia. Una nave da guerra completamente potenziata è la base di ogni campagna di successo, e più investi, più formidabile diventa il tuo vascello."
        },
        {
          "title": "Sistemi d'Arma e Livelli Tecnologici",
          "body": "Potenzia e raffina le tue armi, abilità e livelli tecnologici per dominare su tutti e tre i livelli di battaglia. Artiglieria terrestre per la guerra planetaria, batterie anti-orbitali per gli assalti terra-spazio e array di armi montate sulla nave per il combattimento spazio-spazio. Ogni sistema d'arma può essere raffinato per ruoli tattici specifici. Che tu ti specializzi nel bombardamento a lungo raggio, nelle azioni di abbordaggio a corto raggio o nelle contromisure difensive, il tuo carico di armi definisce la tua identità di combattimento."
        },
        {
          "title": "Recluta Specialisti",
          "body": "Gli specialisti sono i moltiplicatori di forza che separano i buoni giocatori dagli Overlord. Acquisisci specialisti unici che portano potenti bonus alle prestazioni complessive e al livello di potenza della nave. Gli specialisti tattici migliorano l'efficienza del dispiegamento delle truppe, gli specialisti di ingegneria accelerano le riparazioni e i potenziamenti della nave, gli specialisti delle armi aumentano la produzione di danni su tutti i sistemi e gli specialisti dell'intelligence rivelano le posizioni e le debolezze del nemico. Combina più specialisti per creare sinergie devastanti che amplificano ogni aspetto della tua operazione."
        },
        {
          "title": "Costruisci i Tuoi Eserciti",
          "body": "Clona truppe nei laboratori di clonazione a bordo della tua nave, poi potenziale e raffinale insieme alle loro armi finché non sono pronte per la battaglia. Ma le sole truppe non bastano. Addomestica e addestra le creature selvatiche del pianeta per creare cavalleria su bestie montate, una forza che non può essere clonata o fabbricata e che deve essere guadagnata attraverso abilità e pazienza. La composizione del tuo esercito su terra, aria e spazio è ciò che determina la tua dominazione."
        }
      ],
      "rewardsTitle": "Gli Hammerongs, le Ricompense e l'Ecosistema Hyper Tek",
      "rewards": [
        {
          "title": "Gli Hammerongs: La Specie Più Potente in Esistenza",
          "body": "Ogni due settimane, i campi di forza dell'arena centrale cadono e gli Hammerongs arrivano. Sono la specie aliena più forte dell'universo, armata con tecnologia avanzata ben oltre tutto ciò che i giocatori possiedono. Vengono per estrarre le risorse del pianeta, e difendono l'arena con forza totale e schiacciante. Attaccare gli Hammerongs è la sfida più pericolosa in Overlord, ma coloro che riescono vengono ricompensati con enormi bonus, bottino leggendario, materiali di potenziamento rari e ricompense esclusive che non possono essere ottenute in nessun altro modo. L'invasione quindicinale degli Hammerongs è il test definitivo del tuo potere."
        },
        {
          "title": "Eventi Giornalieri, Missioni e Ricompense di Battaglia",
          "body": "Overlord offre ricompense costantemente. Completa compiti giornalieri per guadagnare crediti, materiali di potenziamento e bonus di progressione. Partecipa a eventi speciali per ricompense premium. Svolgi missioni sulla superficie del pianeta e all'interno dell'Anello di Battaglia per bottino esclusivo. Vinci battaglie contro mostri, creature aliene e giocatori rivali per accumulare risorse. Esplora la superficie per scoprire artefatti e tesori nascosti. La struttura delle ricompense è progettata in modo che ogni azione che compi ti avvicini a diventare l'Overlord supremo del server."
        },
        {
          "title": "Collegato all'Ecosistema Hyper Tek",
          "body": "Overlord of the 7 Realms non esiste in isolamento. È completamente integrato nell'universo Hyper Tek insieme a Hyper Racing e Hyper Quest. Le risorse guadagnate in Overlord possono essere utilizzate in tutti e tre i giochi. I potenziamenti della nave, i bonus degli specialisti, le abilità di combattimento e i materiali fluiscono senza soluzione di continuità tra i titoli. Le abilità di guida acquisite in Hyper Racing migliorano le tue abilità da pilota nel combattimento spaziale di Overlord. I materiali raccolti in Hyper Quest alimentano i tuoi potenziamenti sul pianeta. Il marketplace Hyper Tek collega tutto, creando un'economia unificata dove il progresso in un gioco alimenta l'avanzamento in tutti e tre."
        },
        {
          "title": "Un Universo, Tre Giochi, Potere Illimitato",
          "body": "I giocatori che partecipano a tutti e tre i giochi Hyper Tek accumulano potere più velocemente, accedono a ricompense esclusive cross-game e dominano attraverso un'ampiezza di abilità e risorse che i giocatori di un singolo gioco non possono eguagliare. L'ecosistema interconnesso è il vantaggio competitivo definitivo."
        }
      ],
      "faqTitle": "Overlord of the 7 Realms — Domande Frequenti",
      "faq": [
        {
          "q": "Cos'è Overlord of the 7 Realms?",
          "a": "Un gioco di strategia di battaglia a tre livelli dove atterri d'emergenza su un pianeta alieno, ricostruisci la tua nave, cloni eserciti e combatti in tre dimensioni: terra-terra, terra-spazio e spazio-spazio. Presenta interazione VR, ricompense in denaro reale e invasioni quindicinali degli Hammerongs."
        },
        {
          "q": "Cos'è il sistema di battaglia a tre livelli?",
          "a": "Il combattimento opera su tre livelli: terra-terra contro mostri e giocatori rivali, assalti terra-spazio che prendono di mira navi orbitali e guerra spazio-spazio sull'Anello di Battaglia. Questo approccio multidimensionale crea una profondità tattica che nessun gioco di strategia su singolo piano può eguagliare."
        },
        {
          "q": "Cos'è l'Anello di Battaglia?",
          "a": "Una massiccia struttura orbitale che circonda il pianeta. Attracca la tua nave su di esso per cacciare obiettivi senza scudo, lanciare partite di abbordaggio nelle navi nemiche e accedere a missioni nascoste nel suo interno. Controllare l'Anello di Battaglia ti dà un vantaggio strategico sui giocatori esclusivamente terrestri."
        },
        {
          "q": "Posso potenziare la mia nave spaziale?",
          "a": "Ogni sistema è potenziabile dalla sala motori al ponte di comando: scafo, struttura, guscio esterno, generatori di scudi, sistemi di energia e navigazione. In Overlord costruisci per la battaglia, non per la velocità. Una nave da guerra completamente potenziata è la base di ogni campagna."
        },
        {
          "q": "Come funzionano gli specialisti?",
          "a": "Recluta specialisti unici che aggiungono potenti bonus alle prestazioni e al livello di potenza della nave. Specialisti tattici, di ingegneria, delle armi e dell'intelligence potenziano sistemi diversi. Combina più specialisti per creare sinergie devastanti su tutti i livelli di battaglia."
        },
        {
          "q": "Chi sono gli Hammerongs?",
          "a": "La specie aliena più potente in esistenza. Ogni due settimane arrivano all'arena centrale per estrarre le risorse del pianeta, difesi da forza schiacciante e tecnologia avanzata. Attaccarli è estremamente pericoloso ma ricompensa i giocatori con enormi bonus e bottino leggendario."
        },
        {
          "q": "Quali ricompense posso guadagnare?",
          "a": "Compiti giornalieri, missioni, battaglie ed eventi pagano tutti crediti, materiali di potenziamento e bonus di progressione. Gli eventi speciali e le invasioni degli Hammerongs offrono ricompense premium ed esclusive. Le sfide di difficoltà maggiore e le competizioni classificate offrono pagamenti più elevati, incluso denaro reale."
        },
        {
          "q": "Overlord supporta la VR?",
          "a": "Sì. La piena interazione VR in tempo reale ti permette di percorrere i corridoi della tua nave, esplorare l'interno dell'Anello di Battaglia, guidare le truppe nel combattimento terrestre e pilotare il tuo vascello nella guerra spaziale. La VR trasforma Overlord da strategia in un'esperienza di campo di battaglia completamente immersiva."
        },
        {
          "q": "Come costruisco il mio esercito?",
          "a": "Clona truppe nei laboratori a bordo della tua nave, poi potenzia e raffina loro e le loro armi. Per la cavalleria montata, devi addomesticare e addestrare le creature selvatiche del pianeta, poiché gli animali non possono essere clonati. La composizione dell'esercito su terra, aria e spazio determina la tua dominazione."
        },
        {
          "q": "Posso unirmi a un'alleanza?",
          "a": "Sì. Vai da solo o unisciti a un'alleanza che aumenta il tuo potere e ti aiuta a crescere. Le alleanze offrono risorse condivise, attacchi coordinati e difesa collettiva. Completa compiti giornalieri per potenziare sia la tua nave che le risorse condivise dell'alleanza."
        },
        {
          "q": "Overlord è collegato ad altri giochi Hyper Tek?",
          "a": "Completamente integrato. Risorse, potenziamenti della nave, bonus degli specialisti e abilità di combattimento fluiscono tra Overlord, Hyper Racing e Hyper Quest. Le abilità di gara migliorano il tuo combattimento spaziale, i materiali di Quest alimentano i tuoi potenziamenti e il marketplace Hyper Tek connette l'intera economia."
        },
        {
          "q": "Quali armi sono disponibili?",
          "a": "Artiglieria terrestre, batterie anti-orbitali, array di armi montate sulla nave e attrezzatura specializzata per azioni di abbordaggio. Ogni sistema può essere raffinato per ruoli tattici specifici tra cui bombardamento a lungo raggio, combattimento a corto raggio e contromisure difensive."
        },
        {
          "q": "Posso esplorare la superficie del pianeta?",
          "a": "Sì. Il pianeta è ricco di ricompense nascoste, artefatti, risorse e fauna pericolosa da addomesticare. Esplora la superficie per trovare tesori, combattere creature aliene e mostri, e scoprire vantaggi strategici che rafforzano la tua campagna per la dominazione di Overlord."
        }
      ]
    }
  }
}


def deep_merge(base: dict, overlay: dict) -> dict:
    """Recursively merge overlay into base without overwriting existing keys."""
    result = dict(base)
    for key, value in overlay.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        elif key not in result:
            result[key] = value
    return result


def process_file(filename: str, new_data: dict) -> None:
    filepath = os.path.join(LOCALES_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        existing = json.load(f)

    merged = deep_merge(existing, new_data)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
        f.write("\n")

    gp = merged.get("gamePage", {})
    games = ["racing", "quest", "overlord"]
    for g in games:
        keys = list(gp.get(g, {}).keys())
        print(f"  [{g}] keys: {keys}")
    print(f"  -> Written {filepath}")


if __name__ == "__main__":
    print("Processing game-es.json ...")
    process_file("game-es.json", GAME_PAGE_ES)

    print("\nProcessing game-it.json ...")
    process_file("game-it.json", GAME_PAGE_IT)

    print("\nDone.")
