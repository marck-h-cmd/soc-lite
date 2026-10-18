# 06. Catálogo de Datasets Públicos para Pruebas y Entrenamiento de SOC-Lite

Este catálogo compila **56 datasets públicos** especializados en ciberseguridad, organizados en **8 categorías operacionales**. Sirven para pruebas de carga, benchmarking del motor de triaje, validación de reglas heurísticas y evaluación de modelos de lenguaje en tareas de clasificación de alertas.

---

## Categoría 1: Tráfico de Red e Intrusiones (NIDS / PCAP / NetFlow)

| # | Nombre del Dataset | Enlace / Fuente | Licencia | Utilidad en SOC-Lite | Consideraciones de Privacidad |
|---|--------------------|-----------------|----------|----------------------|-------------------------------|
| 1 | **CIC-IDS2017** | [UNB CIC-IDS2017](https://www.unb.ca/cic/datasets/ids-2017.html) | Academic / Non-Commercial | Evaluación de ataques DDoS, Brute Force y PortScan en flujos de red. | Datos sintéticos generados en entorno de laboratorio controlado; sin PII real. |
| 2 | **UNSW-NB15** | [UNSW Research](https://research.unsw.edu.au/projects/unsw-nb15-dataset) | Open Access / Research | Mapeo de vectores de exploits modernos (fuzzers, backdoors, worms). | Red simulada con IXIA PerfectStorm; IPs internas anonimizadas. |
| 3 | **NSL-KDD** | [UNB NSL-KDD](https://www.unb.ca/cic/datasets/nsl.html) | Public Domain | Benchmark histórico de algoritmos de detección de anomalías. | Telemetría clásica sin información identificable moderna. |
| 4 | **CSE-CIC-IDS2018** | [AWS Open Data](https://registry.opendata.aws/cse-cic-ids2018/) | Open Data Commons | Tráfico de red a gran escala en infraestructura cloud de AWS. | Datos sintéticos generados con agentes benignos y atacantes automatizados. |
| 5 | **CTU-13 Dataset** | [Stratosphere IPS](https://www.stratosphereips.org/datasets-ctu13) | CC BY-SA 4.0 | Análisis de tráfico de botnets reales (Neris, Rbot, Virut, Menti). | Tráfico de malware real capturado; IPs externas públicas observadas. |
| 6 | **TON_IoT Dataset** | [UNSW Canberra](https://research.unsw.edu.au/projects/toniot-datasets) | Research Only | Tráfico de telemetría IoT e Industrial con ataques heterogéneos. | Datos generados en testbed IoT; sin credenciales personales. |
| 7 | **ISCX-VPN-NonVPN** | [UNB Datasets](https://www.unb.ca/cic/datasets/vpn.html) | Academic | Clasificación y desglose de túneles VPN y protocolos cifrados. | Tráfico voluntario capturado y anonimizado en laboratorio. |

---

## Categoría 2: Malware, Ransomware y Muestras Binarias

| # | Nombre del Dataset | Enlace / Fuente | Licencia | Utilidad en SOC-Lite | Consideraciones de Privacidad |
|---|--------------------|-----------------|----------|----------------------|-------------------------------|
| 8 | **MalwareBazaar** | [abuse.ch MalwareBazaar](https://bazaar.abuse.ch/) | CC0 1.0 Universal | Muestras de malware reciente, hashes SHA256 y familias activas. | Muestras activas maliciosas; manipular exclusivamente en sandboxes. |
| 9 | **EMBER (Elastic)** | [GitHub Elastic EMBER](https://github.com/endgameinc/ember) | CC BY 4.0 | Extracción de características vectoriales de binarios PE para ML. | Características vectoriales numéricas; no contiene binarios completos. |
| 10 | **SOREL-20M** | [Sophos AI / ReversingLabs](https://github.com/sophos-ai/SOREL-20M) | CC BY 4.0 | 20 millones de archivos analizados con etiquetas de detección. | Conjunto de características y metadatos sin código fuente sensible. |
| 11 | **VirusShare** | [VirusShare.com](https://virusshare.com/) | Academic Access Request | Repositorio masivo de artefactos binarios para análisis de IOCs. | Acceso restringido a investigadores; contiene binarios peligrosos reales. |
| 12 | **BODMAS Dataset** | [BODMAS GitHub](https://github.com/whyisyoung/BODMAS) | Academic / Research | Muestras de malware con familias etiquetadas cronológicamente. | Metadatos y hashes; muestras binarias en entorno seguro. |
| 13 | **Ransomware PoC Dataset** | [The Zoo / ytSF](https://github.com/ytSF/theZoo) | GPL v2 / Research | Estudio de patrones de comportamiento de cifrado y notas de rescate. | Binarios de malware en vivo protegidos con contraseña estándar. |
| 14 | **AndroZoo** | [AndroZoo Research](https://androzoo.uni.lu/) | Research Access | Análisis de aplicaciones móviles maliciosas Android (APKs). | Solo aplicaciones de tiendas públicas; sin datos personales de usuarios. |

---

## Categoría 3: Inteligencia de Amenazas (CTI, Feeds e IOCs)

| # | Nombre del Dataset | Enlace / Fuente | Licencia | Utilidad en SOC-Lite | Consideraciones de Privacidad |
|---|--------------------|-----------------|----------|----------------------|-------------------------------|
| 15 | **AbuseIPDB Blacklist** | [AbuseIPDB](https://www.abuseipdb.com/) | AbuseIPDB API Terms | Lista negra de direcciones IP con puntuación de confianza de abuso. | Reportes de IPs públicas involucradas en ataques; sin IPs residenciales privadas. |
| 16 | **URLhaus** | [abuse.ch URLhaus](https://urlhaus.abuse.ch/) | CC0 1.0 Universal | URLs identificadas distribuyendo malware y payloads en línea. | Dominios y URLs públicas comprometidas; no contiene PII directa. |
| 17 | **ThreatFox** | [abuse.ch ThreatFox](https://threatfox.abuse.ch/) | CC0 1.0 Universal | Indicadores de compromiso (IOCs) asociados con amenazas específicas. | Hashes, IPs C2 y dominios públicos asociados a grupos APT. |
| 18 | **Feodo Tracker** | [abuse.ch Feodo](https://feodotracker.abuse.ch/) | CC0 1.0 Universal | Servidores de Comando y Control (C2) de botnets bancarias activas. | Direcciones IP de servidores C2 públicos reconocidos. |
| 19 | **AlienVault OTX** | [AlienVault OTX](https://otx.alienvault.com/) | OTX Community Terms | Pulses comunitarios de inteligencia de amenazas e IoCs cruzados. | Inteligencia compartida por la comunidad; revisar confidencialidad en pulses. |
| 20 | **CIRCL MISP OSINT** | [CIRCL Feeds](https://www.circl.lu/doc/misp/feed-osint/) | Open Data / CC BY | Eventos MISP estructurados con atributos y objetos de amenazas. | Eventos de fuentes abiertas seleccionadas; saneado de datos privados. |
| 21 | **MaxMind GeoLite2** | [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) | MaxMind End User License | Geolocalización de direcciones IP para enriquecimiento contextual. | Coordenadas a nivel de ciudad aproximada; no identifica domicilios específicos. |

---

## Categoría 4: Vulnerabilidades y Exposiciones (CVE / NVD / Exploits)

| # | Nombre del Dataset | Enlace / Fuente | Licencia | Utilidad en SOC-Lite | Consideraciones de Privacidad |
|---|--------------------|-----------------|----------|----------------------|-------------------------------|
| 22 | **NVD (National Vulnerability Database)** | [NIST NVD](https://nvd.nist.gov/vuln/data-feeds) | Public Domain (US Gov) | Feed de vulnerabilidades CVE con puntuaciones CVSS v2/v3/v4. | Información pública y técnica sin datos de usuarios. |
| 23 | **CISA KEV Catalog** | [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) | Public Domain | Catálogo de vulnerabilidades con explotación activa confirmada. | Datos gubernamentales abiertos y auditados. |
| 24 | **Exploit Database (Exploit-DB)** | [OffSec Exploit-DB](https://gitlab.com/exploit-database/exploitdb) | GPL v2 | PoCs y código de explotación para validar severidades en triaje. | Pruebas de concepto técnicas sobre software vulnerable. |
| 25 | **VulnDB / OpenCVE** | [OpenCVE.io](https://www.opencve.io/) | AGPL v3 | Alertas y suscripciones de CVEs para vinculación con activos. | Solo descripciones técnicas de software y fabricantes. |
| 26 | **GitHub Advisory Database** | [GitHub Advisories](https://github.com/advisories) | CC-BY 4.0 | Vulnerabilidades en ecosistemas de paquetes open source (npm, PyPI). | Reportes de seguridad de código abierto públicos. |
| 27 | **Vulners Vulnerability Feed** | [Vulners.com](https://vulners.com/) | Free API Community | Correlación cruzada de CVEs, boletines de parches y exploits. | Base de datos pública agregada. |
| 28 | **MITRE CVE List** | [cve.org](https://www.cve.org/) | Open Source CVE Terms | Registro canónico de identificadores CVE y estados de asignación. | Registro público global de la industria. |

---

## Categoría 5: Ataques Web y APIs (OWASP Top 10)

| # | Nombre del Dataset | Enlace / Fuente | Licencia | Utilidad en SOC-Lite | Consideraciones de Privacidad |
|---|--------------------|-----------------|----------|----------------------|-------------------------------|
| 29 | **CSIC 2010 HTTP Dataset** | [CSIC ISG](https://www.isi.csic.es/dataset/) | Open Access Research | Peticiones HTTP etiquetadas como normales vs. ataques (SQLi, XSS). | Datos de peticiones a aplicación de comercio electrónico ficticia. |
| 30 | **OWASP ModSecurity Core Rule Set Tests** | [GitHub OWASP CRS](https://github.com/coreruleset/coreruleset) | Apache 2.0 | Cargas de prueba para validar reglas WAF contra inyecciones y evasiones. | Payloads de ataque sintéticos controlados. |
| 31 | **PayloadsAllTheThings** | [GitHub Swisskyrepo](https://github.com/swisskyrepo/PayloadsAllTheThings) | MIT License | Listas completas de payloads de explotación web para matching de regex. | Documentación técnica de metodologías de pentesting. |
| 32 | **SecLists Web Attacks** | [GitHub Daniel Miessler](https://github.com/danielmiessler/SecLists) | MIT License | Diccionarios de fuzzing de parámetros, nombres de archivos y cabeceras. | Listas de palabras públicas recopiladas de fuentes abiertas. |
| 33 | **ECML/PKDD Discovery Challenge** | [ECML/PKDD](http://www.ecmlpkdd2011.org/) | Academic | Tráfico web de comercio electrónico con clasificación de transacciones. | Transacciones ficticias generadas en laboratorio. |
| 34 | **HTTPParams Dataset** | [Kaggle HTTPParams](https://www.kaggle.com/) | CC BY-SA 4.0 | Parámetros GET/POST HTTP etiquetados para entrenamiento de clasificadores. | URLs con parámetros sintetizados para detección de inyecciones. |
| 35 | **SQLi Datasets** | [Kaggle SQL Injection](https://www.kaggle.com/) | Public Domain | Sentencias SQL maliciosas y benignas para entrenamiento de LLM/NLP. | Sentencias SQL descontextualizadas de esquemas de bases de datos reales. |

---

## Categoría 6: Operaciones de SOC, Incident Response y Alertas

| # | Nombre del Dataset | Enlace / Fuente | Licencia | Utilidad en SOC-Lite | Consideraciones de Privacidad |
|---|--------------------|-----------------|----------|----------------------|-------------------------------|
| 36 | **Bobsleigh / Wazuh Sample Rules** | [Wazuh GitHub](https://github.com/wazuh/wazuh-ruleset) | GPL v2 | Reglas de decodificación y alertas de muestra de Wazuh SIEM. | Logs de ejemplo provistos por el fabricante; sin identidades reales. |
| 37 | **Sigma HQ Ruleset** | [SigmaHQ GitHub](https://github.com/SigmaHQ/sigma) | Detection Rule License | Reglas universales de detección para conversión a queries de SIEM. | Reglas de detección lógica basadas en telemetría de amenazas. |
| 38 | **Splunk Attack Data** | [GitHub Splunk](https://github.com/splunk/attack_data) | Apache 2.0 | Registros generados por la simulación de técnicas MITRE ATT&CK. | Datos simulados en entornos virtuales desechables. |
| 39 | **Mordor Dataset** | [GitHub Roberto Rodriguez](https://github.com/OTRF/mordor) | GPL v3 | Registros de eventos de seguridad organizados por técnicas ATT&CK. | Entornos de prueba en laboratorios sin producción involucrada. |
| 40 | **Atomic Red Team Test Results** | [Red Canary](https://github.com/redcanaryco/atomic-red-team) | MIT License | Telemetría producida por la ejecución de pruebas atómicas de adversarios. | Simulaciones locales sobre sistemas Windows y Linux de prueba. |
| 41 | **CAR (Cyber Analytics Repository)** | [MITRE CAR](https://car.mitre.org/) | Apache 2.0 | Análisis de detección analítica basados en modelos de datos de logs. | Especificaciones teóricas y logs sintéticos de verificación. |
| 42 | **SOCbed Benchmark** | [SOCbed Research](https://github.com/) | Open Source Academic | Simulación de colas de alertas de SOC para medir fatiga y precisión de triaje. | Datos de simulación parametrizados de operadores SOC. |

---

## Categoría 7: Phishing, Spam e Ingeniería Social

| # | Nombre del Dataset | Enlace / Fuente | Licencia | Utilidad en SOC-Lite | Consideraciones de Privacidad |
|---|--------------------|-----------------|----------|----------------------|-------------------------------|
| 43 | **PhishTank Data Feed** | [PhishTank](https://www.phishtank.com/developer_info.php) | PhishTank Terms of Use | URLs de phishing verificadas activamente por la comunidad. | Sitios web falsificados reportados; revisar que no contengan tokens en query. |
| 44 | **OpenPhish Feed** | [OpenPhish](https://openphish.com/) | CC BY 4.0 / Free Community | URLs de phishing con marcas corporativas y objetivos identificados. | Feeds de URLs públicas; sin datos de víctimas individuales. |
| 45 | **Enron Email Dataset** | [CMU Enron](https://www.cs.cmu.edu/~./enron/) | Public Domain | Corpus masivo de correos para clasificación de spam y anomalías de texto. | Correos corporativos reales históricos liberados por litigio judicial. |
| 46 | **SpamAssassin Public Corpus** | [Apache SpamAssassin](https://spamassassin.apache.org/publiccorpus/) | Apache 2.0 | Correos etiquetados como spam y ham para filtros bayesianos. | Correos de listas públicas de internet saneados. |
| 47 | **Nazario Phishing Corpus** | [Jose Nazario Corpus](https://monkey.org/~jose/phishing/) | Academic Research | Muestras históricas de correos de phishing para modelado de NLP. | Correos de phishing reales capturados en trampas (*honeypots*). |
| 48 | **Phishing Websites Dataset (UCI)** | [UCI ML Repository](https://archive.ics.uci.edu/dataset/327) | CC BY 4.0 | Características heurísticas de dominios y URLs para detección ML. | Atributos matemáticos de páginas web; sin contenido personal. |
| 49 | **Cert.br Phishing Feeds** | [CERT.br](https://www.cert.br/) | Open Government | Datos de campañas de phishing e incidentes en el espacio de dominios regionales. | Reportes técnicos agregados sin información personal. |

---

## Categoría 8: Telemetría de Host y Sistemas Operativos (EDR / Sysmon / Auditd)

| # | Nombre del Dataset | Enlace / Fuente | Licencia | Utilidad en SOC-Lite | Consideraciones de Privacidad |
|---|--------------------|-----------------|----------|----------------------|-------------------------------|
| 50 | **Sysmon-DFIR Events** | [GitHub SwiftOnSecurity](https://github.com/SwiftOnSecurity/sysmon-config) | MIT License | Configuraciones y logs de Sysmon para rastreo de procesos y DLLs. | Logs de eventos de prueba sin usuarios corporativos reales. |
| 51 | **EVTX Attack Samples** | [GitHub sbousseaden](https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES) | Open Research | Archivos .evtx de Windows con artefactos de intrusión y movimientos laterales. | Laboratorios de emulación de ataques APT; nombres de usuario ficticios. |
| 52 | **Linux Auditd Samples** | [Linux Audit Project](https://github.com/linux-audit/audit-documentation) | GPL v2 | Trazas de auditoría del kernel Linux (`auditd`) para escalado de privilegios. | Telemetría de sistemas virtuales controlados. |
| 53 | **CERT Insider Threat Tools** | [CMU SEI CERT](https://www.sei.cmu.edu/research-capabilities/all-work/display.cfm?customel_datapageid_4050=21294) | Free Public License | Logs sintéticos de amenazas internas (transferencias USB, accesos anómalos). | Datos sintéticos modelados con distribuciones estocásticas; sin personas reales. |
| 54 | **BETH Dataset** | [Kaggle BETH Dataset](https://www.kaggle.com/) | CC BY-NC-SA 4.0 | Telemetría a nivel de kernel y llamadas al sistema para detección de anomalías. | Máquinas virtuales instrumentadas con honeypots. |
| 55 | **Auditbeat Security Logs** | [Elastic Documentation](https://www.elastic.co/guide/en/beats/auditbeat/current/index.html) | Apache 2.0 | Eventos de integridad de archivos (FIM) y auditoría de accesos a paquetes. | Logs de demostración de infraestructura estándar. |
| 56 | **DARPA Transparent Computing** | [DARPA BAA-15-24](https://github.com/bbn-e/Taular) | Public Domain / Research | Grafo de procedencia de eventos a nivel de host en Linux, Windows y Android. | Sistemas experimentales de investigación del Departamento de Defensa de EE.UU. |
