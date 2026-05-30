#!/usr/bin/env python3
"""
Deep-merges fully-translated 'gamePage' content into game-de.json and game-fr.json.
Does NOT overwrite any existing keys — only adds missing ones.
"""

import json
import copy
import os

LOCALES_DIR = os.path.dirname(os.path.abspath(__file__))


# ---------------------------------------------------------------------------
# 1.  GERMAN TRANSLATION  (gamePage only)
# ---------------------------------------------------------------------------

GAME_PAGE_DE = {
    "welcomeTo": "Willkommen bei",
    "back": "Zurück",
    "racing": {
        "label": "RACING",
        "heading": "Hyper Racing",
        "subtitle": "Das intensivste Flugzeug-Rennerlebnis der Galaxis,\nwo Können belohnt wird und Champions geboren werden.",
        "intro": [
            "Hyper Racing ist ein hochoktaniges, kompetitives Rennspiel, das über fremdartige Welten hinweg angesiedelt ist. Spieler bauen, upgraden und pilotieren vollständig anpassbare fliegende Rennfahrzeuge durch einige der gefährlichsten Rennstrecken der Galaxis. Von schwebenden Felsformationen und vulkanischen Lavatunneln bis hin zu Wüstenödland und Gebirgspässen – jedes Rennen ist ein Test aus Vorbereitung, Reflexen und Strategie.",
            "Doch Hyper Racing ist mehr als nur ein Spiel; es ist eine kompetitive Plattform, bei der echte Belohnungen auf dem Spiel stehen. Spitzenspieler können an Ranglistenveranstaltungen und Turnieren mit echten Bargeldpreisgeldern teilnehmen. Je besser du fährst, desto mehr verdienst du. Ob du Rang-Ruhm anstrebst oder ein Racing-Imperium aufbaust – alles, was du in Hyper Racing tust, bringt dich voran.",
            "Upgrade dein Rennfahrzeug von vorne bis hinten. Rekrutiere und level deinen Boxencrew auf. Engagiere einen Boxenmanager, der zu deiner Rennphilosophie passt. Dann nimm deine Fähigkeiten über die Strecke hinaus – deine Renngarge verdoppelt sich als Hangar deines persönlichen Raumschiffs, und jede Fähigkeit, die du entwickelst, überträgt sich in den Weltraumkampf in Hyper Quest und Overlord der 7 Reiche."
        ],
        "introClose": "Lies weiter, um herauszufinden, wie das Spiel funktioniert, was du gewinnen kannst und wie deine Rennkarriere ein ganzes Universum der Weiterentwicklung antreibt.",
        "calloutLine1": "Race to Earn. Earn to Upgrade.",
        "calloutLine2": "Upgrade to Dominate.",
        "howItWorksTitle": "So funktioniert Hyper Racing",
        "howItWorks": [
            {
                "num": "01",
                "title": "Wähle dein Fahrzeug",
                "body": "Jedes Rennen beginnt in deiner Garage. Wähle aus einem wachsenden Aufgebot fliegender Rennfahrzeuge, jedes mit einzigartigen Fahreigenschaften und Upgrade-Potenzial. Strippe eine Hülle für blitzschnelle Geradeausgeschwindigkeit oder panzere sie auf, um die brutalsten Bedingungen zu überstehen. Triebwerke, Stabilisatoren, Schilde, Kühlsysteme, aerodynamische Flossen – der Upgrade-Baum ist tief, und jede Modifikation verändert das Verhalten deines Gefährts auf der Strecke."
            },
            {
                "num": "02",
                "title": "Stelle dein Team zusammen",
                "body": "Rennsport ist ein Teamsport. Rekrutiere Boxencrew-Spezialisten mit einzigartigen Boni: schnellere Betankung, Echtzeit-Diagnosen, Notreparaturen mitten im Rennen und Leistungsoptimierungen zwischen den Runden. Jedes Crew-Mitglied levelt mit Erfahrung auf und stapelt mächtige Fähigkeiten auf deine Fahrzeug-Upgrades. Engagiere dann einen Boxenmanager, der Operationen koordiniert, Rennstrategie vorgibt und teamweite Leistungssteigerungen freischaltet, die sich über eine ganze Saison summieren."
            },
            {
                "num": "03",
                "title": "Race Across Worlds",
                "body": "Rennstrecken erstrecken sich über fremdartige Planeten mit völlig unterschiedlichem Terrain und atmosphärischen Gefahren. Webe durch Avatar-artige schwebende Felsformationen, fädele dich mit Höchstgeschwindigkeit durch vulkanische Lavatunnel, rase über endlose Wüstenebenen und schnitze dich durch unwegsame Gebirgsketten. Säureregen, radioaktive Atmosphären, wechselnde Schwerkraft und turbulente Winde – kein Rennen verlangt dasselbe Setup. Dein Fahrzeug auf die jeweilige Umgebung abstimmen, ist der Punkt, wo Strategie auf Können trifft."
            },
            {
                "num": "04",
                "title": "Erklimme die Ranglisten",
                "body": "Siege bringen Leader-Punkte, schalten neue Rennstrecken auf fernen Welten frei und öffnen die Tür zu höherstufigen Wettbewerben. Je tiefer du vordringst, desto erbitterter die Gegner und desto höher die Einsätze. Beweise dich auf jedem Planeten und steige in der globalen Rangliste auf."
            }
        ],
        "rewardsTitle": "Groß gewinnen – Belohnungen, die zählen!",
        "rewards": [
            {
                "title": "In-Game-Belohnungen",
                "body": "Jedes Rennen, das du beendest, zahlt sich aus. Siege multiplizieren die Belohnungen. Rennerfolge schalten Premium-Fahrzeugkomponenten, seltene Upgrade-Materialien, exklusive Crew-Rekrutierungstoken und Credits frei, um deinen nächsten Build zu finanzieren. Verkaufe upgegradete Fahrzeuge mit Gewinn, reinvestiere in neue Maschinen und beobachte, wie dein Racing-Imperium mit jedem Podiumsfinish wächst."
            },
            {
                "title": "Echte Bargeldevents",
                "body": "Hyper Racing hebt den Wettbewerb mit Ranglistenveranstaltungen und Turnieren, bei denen echtes Geld auf dem Spiel steht, auf das nächste Level. Nimm an fertigkeitsbasierten Wettbewerben teil, beweise dein Können gegen die besten Piloten der Galaxis und gehe mit echten Bargeldauszahlungen nach Hause. Je höher du platzierst, desto größer der Preispool. Von wöchentlichen Ranglistenherausforderungen bis hin zu saisonalen Meisterschaftsveranstaltungen – Top-Performer haben immer Gelegenheiten, ihre Rennfähigkeiten in echte Einnahmen umzumünzen."
            },
            {
                "title": "Wie Preis-Events funktionieren",
                "body": "Spieler qualifizieren sich durch Ranglistenspiele und erfüllen Leistungsschwellen, die den Eintritt zu Bargeldpreisturnieren gewähren. Events sind um faire Matchmaking-Strukturen herum aufgebaut, sodass jeder Teilnehmer Gegner mit ähnlichem Können trifft. Startgebühren sind transparent, Preispools werden klar angezeigt, bevor du dich verpflichtest, und Auszahlungen werden schnell nach Abschluss jedes Events verarbeitet. Kompetitiv, fair und die Belohnungen sind real."
            },
            {
                "title": "Fortschritt über die Strecke hinaus",
                "body": "Belohnungen aus dem Rennsport fließen direkt in deinen übergeordneten Fortschritt ein. Upgrade deine Rennfahrzeuge, stärke deinen Boxencrew und leite Gewinne in die Aufrüstung deines Hauptraumschiffs um. Deine Renngarge ist der Hangarraum dieses Schiffes – also stärkt jede Verbesserung deiner Rennoperation auch das Gefährt, mit dem du zwischen Welten und in den Weltraumkampf in Hyper Quest und Overlord der 7 Reiche fliegst."
            }
        ],
        "upgradesTitle": "Zwei Maschinen, eine Mission … Upgrade alles",
        "upgrades": [
            {
                "title": "Rennfahrzeug-Upgrades",
                "body": "Dein Rennfahrzeug ist eine vollständig modulare Maschine. Jede Komponente kann getauscht, abgestimmt und aufgewertet werden: Hüllen, Triebwerke, Schilde, Außenhüllen, Motoren, Stabilisatoren, Kühlsysteme und aerodynamische Flächen. Leichtbauverbundwerkstoffe liefern rohe Geschwindigkeit; schwere Panzerung hält dich durch brutale atmosphärische Bedingungen am Leben. Der Upgrade-Pfad ist tiefgreifend, und die Entscheidungen, die du triffst, definieren deine Racing-Identität. Kaufe neue Fahrzeuge, baue sie zu Meisterschaftskandidaten auf, fahre sie zum Sieg und verkaufe sie mit Gewinn, wenn du bereit für die nächste Herausforderung bist."
            },
            {
                "title": "Hauptraumschiff-Upgrades",
                "body": "Deine Renngarge ist nicht nur eine Werkstatt; sie ist der Hangarraum deines persönlichen Raumschiffs. Dieselben Ressourcen, Credits und Materialien, die du auf der Strecke verdienst, können in das Upgrade deines Hauptfahrzeugs investiert werden. Bessere Motoren für interplanetare Reisen, stärkere Waffensysteme für den Weltraumkampf, verbesserte Navigation für die Entdeckung neuer Rennwelten und verstärkte Hüllen für das Überleben feindlicher Begegnungen während des Transits. Dein Raumschiff ist deine Heimatbasis, dein Transport und dein Schlachtschiff – und Rennsport macht es stärker."
            },
            {
                "title": "Der Upgrade-Loop",
                "body": "Fahre um zu verdienen. Verdiene, um aufzuwerten. Werte auf, um größere Rennen mit größeren Belohnungen zu gewinnen. Leite diese Belohnungen in deine Rennfahrzeuge und dein Raumschiff um. Je besser dein Schiff, desto weiter reist du und desto gefährlicher und lukrativer werden die Rennstrecken. Es ist ein Fortschritts-Loop, der Hingabe und Können auf jeder Ebene belohnt."
            },
            {
                "title": "Spielübergreifender Einfluss",
                "body": "Jede Pilotenfähigkeit, die du auf der Strecke entwickelst, und jedes Upgrade, das du an deinem Raumschiff installierst, überträgt sich direkt in Hyper Quest und Overlord der 7 Reiche. Ein Universum, mehrere Spiele, nahtloser Fortschritt. Was du in Hyper Racing aufbaust, treibt alles andere an."
            }
        ],
        "faqTitle": "Hyper Racing — Häufig gestellte Fragen",
        "faq": [
            {
                "q": "Was ist Hyper Racing?",
                "a": "Ein hochintensives Flugzeug-Rennspiel, das über fremdartige Welten hinweg angesiedelt ist. Baue, upgrade und fahre vollständig anpassbare Fahrzeuge durch gefährliche Sci-Fi-Rennstrecken, während du um In-Game-Belohnungen und echte Bargeldpreise kämpfst."
            },
            {
                "q": "Kann ich mein Rennfahrzeug upgraden?",
                "a": "Jede Komponente ist aufwertbar: Hüllen, Triebwerke, Schilde, Außenhüllen, Motoren, Stabilisatoren, Kühlsysteme und aerodynamische Flächen. Jedes Upgrade verändert, wie sich dein Fahrzeug auf verschiedenen Strecken und unter verschiedenen Bedingungen verhält."
            },
            {
                "q": "Was macht der Boxencrew?",
                "a": "Boxencrew-Mitglieder bieten einzigartige Boni: schnellere Betankung, Hüllendiagnosen, Notfallreparaturen und Leistungsoptimierungen zwischen den Runden. Sie leveln im Laufe der Zeit auf und schalten stärkere Fähigkeiten frei, die sich mit Fahrzeug-Upgrades stapeln."
            },
            {
                "q": "Wie funktioniert der Boxenmanager?",
                "a": "Der Boxenmanager koordiniert Crew-Operationen, gibt Rennstrategie vor und schaltet teamweite Leistungssteigerungen frei. Defensive Manager schützen dein Fahrzeug unter harten Bedingungen; aggressive Manager pushen jedes System auf Höchstgeschwindigkeit."
            },
            {
                "q": "Kann ich echtes Geld gewinnen?",
                "a": "Ja. Ranglistenveranstaltungen und Turniere bieten echte Bargeldpreispools. Qualifiziere dich durch Ranglistenspiele, tritt gegen ähnlich fähige Gegner an und verdiene echte Auszahlungen basierend auf deiner Abschlussposition. Wöchentliche Herausforderungen und saisonale Meisterschaften laufen kontinuierlich."
            },
            {
                "q": "Wie funktionieren Rennbelohnungen?",
                "a": "Jedes Rennen zahlt Credits, Upgrade-Materialien und Crew-Token aus. Siege multiplizieren deine Einnahmen. Kaufe Fahrzeuge, upgrade sie zu Rennmaschinen, gewinne Rennen und verkaufe sie mit Gewinn, um weitere Verbesserungen und Raumschiff-Upgrades zu finanzieren."
            },
            {
                "q": "Kann ich auch mein Hauptraumschiff upgraden?",
                "a": "Absolut. Deine Renngarge ist der Hangarraum deines Raumschiffs. Renngewinne finanzieren Upgrades für Motoren, Waffen, Navigation und Hüllenverstärkung an deinem Hauptfahrzeug und stärken interplanetare Reisen und Weltraumkämpfe."
            },
            {
                "q": "Wird der Fortschritt auf andere Spiele übertragen?",
                "a": "Jede Pilotenfähigkeit und jedes Raumschiff-Upgrade überträgt sich direkt in Hyper Quest und Overlord der 7 Reiche. Ein Universum, mehrere Spiele, nahtloser Fortschritt. Was du in Hyper Racing aufbaust, treibt alles andere an."
            },
            {
                "q": "Welche Rennumgebungen gibt es?",
                "a": "Rennstrecken erstrecken sich über schwebende Felsformationen, Lavatunnel, Wüstenebenen und Gebirgsketten auf fremden Welten. Atmosphärische Gefahren umfassen Säureregen, radioaktive Atmosphären, variable Schwerkraft und turbulente Winde. Jede Rennstrecke erfordert andere Fahrzeug-Setups."
            }
        ]
    },
    "quest": {
        "label": "QUEST",
        "heading": "Hyper Quest",
        "subtitle": "Deine Galaxis. Deine Regeln. Dein Schicksal.",
        "intro": [
            "Hyper Quest ist ein Open-World-Weltraumabenteuer, in dem du dein eigenes, vollständig upgradbares Raumschiff – den Quest Racer – durch eine weite und gefährliche Galaxis kommandierst. Du hast deine Heimatzivilisation vor Jahren auf der Suche nach Macht, Reichtum und Ruhm verlassen. Jetzt ist das gesamte Universum dein Spielplatz, und jede Quest, die du abschließt, bringt dich näher an die galaktische Herrschaft.",
            "Doch Hyper Quest ist nicht nur ein Spiel. Es ist eine kompetitive Plattform, bei der echtes Geld auf dem Spiel steht. Schließe Quests ab, bezwinge Herausforderungen und gehe mit echtem Geld und/oder Belohnungen nach Hause. Von schnellen Missionen, die Minuten dauern, bis hin zu epischen mehrtägigen Expeditionen – jede Quest zahlt sich aus. Je schwieriger die Herausforderung, desto größer die Belohnung.",
            "Upgrade dein Raumschiff von der Hülle bis zum Cockpit. Rüste es mit verheerenden Waffensystemen aus. Rekrutiere Spezialisten, die mächtige Boni auf die Leistung und den Kraftlevel deines Schiffes stapeln. Durchforste Asteroiden, transportiere gefährliche Fracht, jage verborgene Schätze, entführe hochwertige Ziele oder werde ein Söldner. Wie du das Universum regierst, liegt völlig bei dir.",
            "Alles, was du in Hyper Quest aufbaust, fließt direkt in Hyper Racing und Overlord der 7 Reiche ein. Ein Universum, nahtloser Fortschritt, unbegrenzte Möglichkeiten. Lies weiter, um herauszufinden, wie Questing funktioniert, was du verdienen kannst und wie du und dein Raumschiff zum meistgefürchteten Gefährt in der Galaxis werden."
        ],
        "calloutLine1": "Quest to Earn. Earn to Upgrade.",
        "calloutLine2": "Upgrade to Conquer.",
        "howItWorksTitle": "So funktioniert Hyper Quest",
        "howItWorks": [
            {
                "num": "01",
                "title": "Nimm Quests vom Missionsbrett an",
                "body": "Das In-Game-Questing-Board ist dein Tor zum Abenteuer. Durchstöbere verfügbare Missionen – von schnellen Frachttransporten, die nur Minuten dauern, bis hin zu epischen mehrtägigen Expeditionen tief in unerforschten Weltraum. Jede Quest kommt mit klaren Zielen, Gefahrenbewertungen und Belohnungsstufen. Wähle die Missionen, die zu deinem Spielstil passen – ob gefährliche Fracht transportieren, verborgene Schätze jagen, Asteroidenfelder abbauen oder undercover vorgehen, um verlorene Artefakte zu bergen."
            },
            {
                "num": "02",
                "title": "Erkunde die Galaxis",
                "body": "Reise durch Portale zu fernen Planeten, jeweils mit einzigartigen Umgebungen, wertvollen Materialien und neuen Rennstrecken. Folge galaktischen Karten, um unerforschte Regionen zu kartieren und Namenrechte für Planeten zu verdienen, die du zuerst entdeckst. Baue Ressourcen aus Asteroidenfeldern ab, berge Teile aus alten Relikten und verlassenen Schiffen und sammle Hinweise, die zu verborgenen Schätzen führen, die über die Sterne verstreut sind."
            },
            {
                "num": "03",
                "title": "Baue dein Imperium innerhalb deines Schiffes auf",
                "body": "Dein Quest Racer ist mehr als nur Transport. Baue Nahrung in hydroponischen Anlagen an, raffiniere Materialien, die von fernen Planeten abgebaut wurden, und baue Armeen in deinen Klonlaboren auf. Verfeinere deine Truppen und ihre Waffen, verteidige dich gegen Piraten und verwalte eine selbsttragende mobile Basis, die mit jeder abgeschlossenen Mission mächtiger wird."
            },
            {
                "num": "04",
                "title": "Spiel auf deine Art",
                "body": "Es gibt keinen einzigen Weg zur Dominanz. Werde ein gefürchteter Kopfgeldjäger, ein gerissener Schmuggler, ein Meisterbergbauarbeiter oder ein legendärer Entdecker. Entführe hochwertige Ziele, werde Söldner oder schmiede Allianzen, um ganze Sektoren zu kontrollieren. Die Galaxis beugt sich deinem Willen, und jede Entscheidung prägt deinen Ruf und dein Vermögen."
            }
        ],
        "rewardsTitle": "Quest-Belohnungen – Werde bezahlt fürs Spielen!",
        "rewards": [
            {
                "title": "In-Game-Belohnungen",
                "body": "Jede Quest, die du abschließt, zahlt sich aus. Credits, Upgrade-Materialien, seltene Komponenten, Spezialisten-Rekrutierungstoken und exklusive Gegenstände fließen mit jeder erfolgreichen Mission in dein Inventar. Je schwieriger die Quest, desto reicher die Beute. Entdecke seltene Materialien auf fernen Planeten, berge hochwertige Teile aus alten Relikten und stocke Ressourcen auf, die deinen Aufstieg zur galaktischen Vorherrschaft antreiben."
            },
            {
                "title": "Echte Bargeldauszahlungen",
                "body": "Hyper Quest hebt Gaming über Unterhaltung hinaus. Bestimmte Quests und Ranglistenherausforderungen bieten echte Bargeldauszahlungen. Schließe hochstufige Missionen ab, dominiere Leaderboard-Events und nimm an saisonalen Quest-Meisterschaften teil, bei denen echtes Geld auf dem Spiel steht. Je fähiger und mutiger du wirst, desto größer die Auszahlungen. Von wöchentlichen Quest-Kopfgeldern bis hin zu epischen saisonalen Turnieren – es gibt immer Gelegenheiten, deine galaktischen Abenteuer in echte Einnahmen umzuwandeln."
            },
            {
                "title": "Wie Quest-Auszahlungen funktionieren",
                "body": "Spieler qualifizieren sich für Bargeld-Belohnungs-Quests, indem sie ihren Ruf aufbauen und Leistungsschwellen erfüllen. Quest-Schwierigkeit, -Dauer und Gefahrenstufe bestimmen den Preispool. Auszahlungen sind transparent, werden klar angezeigt, bevor du eine Mission akzeptierst, und werden nach Abschluss schnell verarbeitet. Ob du einen zehnminütigen Frachttransport oder eine wochenlange Tiefraumexpedition durchführst – die Belohnungen entsprechen dem Risiko."
            },
            {
                "title": "Fortschritt, der sich weiterzieht",
                "body": "Quest-Belohnungen fließen direkt in deine Schiffs-Upgrades, Waffensysteme und Spezialisten-Rekrutierung ein. Jede Auszahlung macht dich stärker, was härtere Quests mit noch größeren Belohnungen freischaltet. Einnahmen übertragen sich auch in Hyper Racing und Overlord der 7 Reiche, wodurch ein Fortschritts-Loop entsteht, der Hingabe im gesamten Hyper-Tek-Ökosystem belohnt."
            }
        ],
        "upgradesTitle": "Upgrade dein Schiff, rüste dein Arsenal auf, rekrutiere deine Crew",
        "upgrades": [
            {
                "title": "Raumschiff-Upgrades",
                "body": "Dein Quest Racer ist vom Maschinenraum bis zum Cockpit vollständig modular. Upgrade die Hülle für maximale Haltbarkeit, verstärke die Außenhülle, um feindlichen Umgebungen standzuhalten, steigere Schildgeneratoren für Kampfüberlebensfähigkeit und überhole Energiesysteme für Spitzenleistung. Bessere Motoren bedeuten schnellere interplanetare Reisen. Stärkere Navigationssysteme enthüllen verborgene Routen und unerforschte Welten. Jedes Upgrade verwandelt dein Schiff in ein mächtigeres, gefürchteteres Gefährt."
            },
            {
                "title": "Waffensysteme",
                "body": "Die Galaxis ist gefährlich, und du musst noch gefährlicher sein. Upgrade und verfeinere deine Waffensysteme, um dich gegen Piraten, gegnerische Spieler und feindliche Kräfte zu schützen. Wähle zwischen defensiven Konfigurationen, die dich in den schlimmsten Situationen am Leben erhalten, oder offensiven Loadouts, die darauf ausgelegt sind, maximalen Schaden anzurichten. Laser-Arrays, Raketenbatterien, Plasmakanonen und experimentelle Energiewaffen sind alle verfügbar, während du durch den Upgrade-Baum voranschreitest."
            },
            {
                "title": "Rekrutiere Spezialisten",
                "body": "Spezialisten sind Gamechanger. Jeder bringt einzigartige Fähigkeiten mit, die mächtige Boni auf die Gesamtleistung und den Kraftlevel deines Schiffes hinzufügen. Navigationsspezialisten enthüllen verborgene Pfade und verkürzen Reisezeiten. Kampfspezialisten steigern Waffengenauigkeit und Schadensoutput. Ingenieurspezialisten erhöhen die Hüllenintegrität und Reparaturgeschwindigkeit. Wissenschaftsspezialisten verbessern die Ressourcengewinnung und Materialraffinierung. Stapele mehrere Spezialisten, um verheerende Kombinationen zu schaffen, die die Effektivität deines Schiffes multiplizieren."
            },
            {
                "title": "Der Kraft-Loop",
                "body": "Absolviere Quests um zu verdienen. Verdiene, um aufzuwerten. Werte auf, um härtere Quests mit größeren Belohnungen zu bezwingen. Rekrutiere Spezialisten, um jedes System auf deinem Schiff zu verstärken. Je stärker du wirst, desto mehr der Galaxis öffnet sich dir, und desto größer das Vermögen, das auf dich wartet. Schiffs-Upgrades und Spezialisten-Boni übertragen sich auch direkt in den Weltraumkampf während des Hyper-Racing-Transits und in Schlachten in Overlord der 7 Reiche."
            }
        ],
        "faqTitle": "Hyper Quest — Häufig gestellte Fragen",
        "faq": [
            {
                "q": "Was ist Hyper Quest?",
                "a": "Ein Open-World-Weltraumabenteuer, in dem du ein vollständig upgradbares Raumschiff durch eine weite Galaxis kommandierst. Schließe Quests ab, erkunde fremdartige Welten, upgrade dein Schiff, rekrutiere Spezialisten und verdiene echte Bargeldbelohnungen neben In-Game-Reichtümern."
            },
            {
                "q": "Wie funktionieren Quests?",
                "a": "Nimm Missionen vom In-Game-Questing-Board an. Quests reichen von schnellen Frachttransporten, die nur Minuten dauern, bis hin zu epischen mehrtägigen Expeditionen tief in unerforschten Weltraum. Jede Quest hat klare Ziele, Gefahrenbewertungen und Belohnungsstufen, die vor der Annahme angezeigt werden."
            },
            {
                "q": "Kann ich echtes Geld verdienen?",
                "a": "Ja. Bestimmte Quests, Ranglistenherausforderungen und saisonale Meisterschaften bieten echte Bargeldauszahlungen. Baue deinen Ruf auf, erfülle Leistungsschwellen und qualifiziere dich für immer lukrativere Bargeld-Belohnungsmissionen. Wöchentliche Kopfgelder und saisonale Turniere laufen kontinuierlich."
            },
            {
                "q": "Welche In-Game-Belohnungen kann ich verdienen?",
                "a": "Jede abgeschlossene Quest zahlt Credits, Upgrade-Materialien, seltene Komponenten, Spezialisten-Rekrutierungstoken und exklusive Gegenstände aus. Je schwieriger und länger die Quest, desto reicher die Belohnungen. Entdecke seltene Materialien auf fernen Planeten und berge hochwertige Teile aus alten Relikten."
            },
            {
                "q": "Kann ich mein Raumschiff upgraden?",
                "a": "Jedes System ist aufwertbar: Hülle, Außenhülle, Schildgeneratoren, Energiesysteme, Motoren, Cockpit und Navigation. Bessere Motoren bedeuten schnellere Reisen, stärkere Hüllen überstehen feindliche Begegnungen, und upgegradete Navigation enthüllt verborgene Routen und unerforschte Welten."
            },
            {
                "q": "Welche Waffen sind verfügbar?",
                "a": "Upgrade und verfeinere Waffensysteme, darunter Laser-Arrays, Raketenbatterien, Plasmakanonen und experimentelle Energiewaffen. Wähle defensive Konfigurationen zum Überleben oder offensive Loadouts für maximalen Schaden gegen Piraten, Gegner und feindliche Kräfte."
            },
            {
                "q": "Wie funktionieren Spezialisten?",
                "a": "Rekrutiere Spezialisten mit einzigartigen Fähigkeiten, die mächtige Boni auf die Leistung und den Kraftlevel deines Schiffes hinzufügen. Navigationsspezialisten enthüllen verborgene Pfade, Kampfspezialisten steigern Waffenschaden, Ingenieurspezialisten erhöhen die Hüllenintegrität, und Wissenschaftsspezialisten verbessern die Ressourcengewinnung. Stapele mehrere Spezialisten für verheerende Kombinationen."
            },
            {
                "q": "Welche Arten von Quests gibt es?",
                "a": "Frachttransport, Asteroidenabbau, Schatzsuche, Kopfgeldjagd, Artefaktbergung, Undercoveroperationen, planetare Erkundung, Piratenabwehr, Bergungsmissionen und mehr. Quests reichen von schnellen Zehn-Minuten-Läufen bis hin zu mehrtägigen Tiefraumexpeditionen."
            },
            {
                "q": "Kann ich neue Planeten entdecken?",
                "a": "Ja. Folge galaktischen Karten in unerforschte Regionen und entdecke neue Welten. Erstentdecker erhalten Namenrechte für die Planeten, die sie finden. Neue Welten bieten einzigartige Materialien, Umgebungen und Rennstrecken, auf die kein anderer Spieler zuvor zugegriffen hat."
            },
            {
                "q": "Was kann ich innerhalb meines Schiffes tun?",
                "a": "Dein Quest Racer ist eine mobile Basis. Baue Nahrung in hydroponischen Anlagen an, raffiniere Materialien, die von fernen Planeten abgebaut wurden, baue und trainiere Armeen in Klonlaboren, upgrade Waffen und Verteidigungen und verwalte einen selbsttragenden Betrieb, der mit jeder Mission mächtiger wird."
            },
            {
                "q": "Wie funktioniert die galaktische Karte?",
                "a": "Die galaktische Karte leitet deine Erkundung durch das Universum. Upgrade deine Karte, um neue Sektoren, Portalstandorte und verborgene Quest-Zonen zu enthüllen. Je weiter du erkundest, desto mehr erweitert sich die Karte und schaltet immer gefährlichere und lohnendere Regionen des Weltraums frei."
            },
            {
                "q": "Wird mein Fortschritt auf andere Spiele übertragen?",
                "a": "Alles, was du in Hyper Quest aufbaust, fließt direkt in Hyper Racing und Overlord der 7 Reiche ein. Schiffs-Upgrades, Spezialisten-Boni, Kampffähigkeiten und Ressourcen übertragen sich nahtlos. Ein Universum, mehrere Spiele, unbegrenzter Fortschritt."
            },
            {
                "q": "Kann ich als Bösewicht spielen?",
                "a": "Absolut. Gehe undercover, entführe hochwertige Ziele, werde Söldner, schmuggele gefährliche Fracht oder überfalle andere Spieler. Es gibt keinen einzigen Weg zur Dominanz. Wie du die Galaxis regierst, liegt völlig bei dir, und jede Entscheidung prägt deinen Ruf."
            }
        ]
    },
    "overlord": {
        "label": "OVERLORD",
        "heading": "Overlord der 7 Reiche",
        "subtitle": "Crash-landen. Wiederaufbauen. Erobern. Werde der Overlord.",
        "intro": [
            "Overlord der 7 Reiche ist ein dreidimensionales Kampfstrategiespiel, das seinesgleichen sucht. Du bist durch ein Portal in ein Paralleluniversum gereist und auf einem feindlichen Alien-Planeten notgelandet. Dein Schiff ist zerstört, deine Systeme versagen, und die Kreaturen des Planeten nähern sich bereits. Überleben ist erst der Anfang. Dominanz ist das Ziel.",
            "Baue dein Schiff aus den Trümmern wieder auf. Klone und trainiere Armeen in deinen Bord-Laboren. Zähme die Wildtiere des Planeten, um verheerende beritten Kavallerie zu erschaffen. Dann nimm den Kampf über drei Schlachtdimensionen hinaus: Boden-gegen-Boden-Kampf gegen Monster und gegnerische Spieler, Boden-gegen-Weltraum-Angriffe auf orbitale oder Bodenziele und Weltraum-gegen-Weltraum-Kriegsführung an Bord des massiven Kampfrings, der den Planeten umkreist.",
            "Dies ist nicht nur ein weiteres Strategiespiel. Overlord bietet Echtzeit-VR-Interaktion, echte Bargeldbelohnungen für das Abschließen täglicher Events und Quests und zweiwöchentliche Invasionen durch die furchterregenden Hammerongs – die mächtigste Alienspezies aller Zeiten. Alle zwei Wochen kommen sie, um den Planeten auszubeuten, und alle zwei Wochen können mutige Spieler sie für massive Boni und legendäre Belohnungen herausfordern.",
            "Upgrade dein Raumschiff, rüste es mit verheerenden Waffen aus, rekrutiere Spezialisten, die deinen Kraftlevel verstärken, und schmiede Allianzen, um ganze Regionen zu kontrollieren. Alles, was du aufbaust, verbindet sich direkt mit Hyper Racing und Hyper Quest durch das gemeinsame Hyper-Tek-Ökosystem. Ein Universum, drei Spiele, grenzenlose Kriegsführung. Lies weiter, um herauszufinden, wie das Kampfsystem funktioniert und warum Overlord alles verändert."
        ],
        "calloutLine1": "Überleben ist erst der Anfang.",
        "calloutLine2": "Dominanz ist das Ziel.",
        "howItWorksTitle": "Das Dreistufige Kampfsystem – Drei Dimensionen des Krieges",
        "howItWorks": [
            {
                "num": "01",
                "title": "Boden-gegen-Boden-Kampf",
                "body": "Die Oberfläche des Planeten ist eine Kriegszone. Setze deine geklonten Armeen gegen feindliche Alien-Kreaturen, monströse Bestien und gegnerische Spieler ein, die um Territorium und Ressourcen kämpfen. Zähme und trainiere die Wildtiere des Planeten, um beritten Kavallerieeinheiten zu schaffen, die deinen Bodentruppen einen verheerenden Vorteil verschaffen. Bodenkrieg ist roh, taktisch und unerbittlich. Jede gewonnene Schlacht bringt Ressourcen, Territorium und Ruf."
            },
            {
                "num": "02",
                "title": "Boden-gegen-Weltraum-Angriffe",
                "body": "Hier fügt Overlord eine Dimension hinzu, die kein, oder fast kein, anderes Spiel bietet. Erstelle spezialisierte Truppengruppen, die darauf ausgelegt sind, Angriffe zwischen der Planetenoberfläche und dem orbitalen Kampfring zu starten. Greife Schiffe an, die im Weltraum stationiert sind, von deiner Bodenposition aus, oder koordiniere kombinierte Angriffe, die Feinde gleichzeitig von oben und unten treffen. Diese vertikale Kampfschicht verwandelt Standard-Strategie in ein mehrdimensionales Schachspiel, bei dem die Positionierung über Boden und Weltraum hinweg den Sieg bestimmt."
            },
            {
                "num": "03",
                "title": "Weltraum-gegen-Weltraum-Kriegsführung",
                "body": "Teleportiere dein Schiff in die Umlaufbahn und lande auf dem Kampfring – einer massiven Orbitalstruktur, die den Planeten umkreist. Von hier aus jagst du ungeschützte Schiffe und verwundbare Ziele. Teleportiere Truppen durch den Weltraum und direkt in feindliche Schiffe, um mit speziell entwickelten Enterangriffen maximalen internen Schaden anzurichten. Weltraumkampfbelohnungen gehören zu den höchsten im Spiel, und die Kontrolle über orbitales Territorium verschafft dir einen strategischen Vorteil, den kein reiner Bodenspieler erreichen kann."
            },
            {
                "num": "04",
                "title": "Warum das Dreistufige System alles verändert",
                "body": "Die meisten Strategiespiele operieren auf einer einzigen Ebene. Overlord operiert auf drei. Die Möglichkeit, von Boden zu Boden, Boden zu Weltraum und Weltraum zu Weltraum anzugreifen, schafft ein Schlachtfeld mit unvergleichbarer taktischer Tiefe. Können ist alles. Reine Gewalt allein wird dich nicht zum Overlord machen. Strategische Meisterschaft auf allen drei Ebenen trennt die Dominanten von den Besiegten."
            }
        ],
        "extraSection": {
            "title": "Der Kampfring und VR-Interaktion",
            "items": [
                {
                    "title": "Landen auf dem Kampfring",
                    "body": "Der Kampfring ist eine kolossale Orbitalstruktur, die das Planetensystem umkreist. Wenn du dein Schiff in den Weltraum teleportierst, kannst du am Kampfring andocken, um einen massiven strategischen Vorteil zu erlangen. Von dieser erhöhten Position aus kannst du ungeschützte Schiffe jagen, Enterkommandos in gegnerische Schiffe entsenden und verheerende Angriffe auf Bodenziele koordinieren. Das Landen auf dem Kampfring eröffnet eine völlig neue Dimension des Gameplays, die die meisten Strategiespiele schlicht nicht bieten – und gibt Overlord einen taktischen Vorsprung gegenüber allem anderen auf dem Markt."
                },
                {
                    "title": "Im Inneren des Kampfrings",
                    "body": "Der Kampfring ist nicht nur eine Andockplattform. Wenn du herausfinden kannst, wie du sein Inneres durchbrechen kannst, erwarten dich dort versteckte Quests, Extraboni und exklusive Belohnungen. Das Innere des Rings ist ein Labyrinth aus Korridoren, Kammern und alter Technologie. Führe Quests und Jagdmissionen innerhalb des Rings selbst durch und entdecke Geheimnisse, auf die kein oberflächengebundener Spieler jemals zugreifen wird. Der Kampfring belohnt die Mutigen, die Gerissenen und die Unerbittlichen."
                },
                {
                    "title": "Echtzeit-VR-Interaktion",
                    "body": "Wie alle Spiele der Hyper-Tek-Reihe unterstützt Overlord der 7 Reiche vollständige VR-Interaktion in Echtzeit. Betrete dein Schiff, geh durch die Korridore des Kampfrings, führe deine Truppen in den Bodenkampf und erlebe Weltraumkämpfe vom Cockpit deines Gefährts aus. VR verwandelt Overlord von einem Strategiespiel in ein vollständig immersives Schlachterlebnis. Kommandiere deine Truppen, erkunde außerirdisches Terrain und nimm an Kämpfen mit einem Maß an Präsenz und Intensität teil, das Flatscreen-Gaming nicht replizieren kann."
                },
                {
                    "title": "Der Vorteil gegenüber anderen Spielen",
                    "body": "Kein anderes Spiel kombiniert dreistufige Kriegsführung, eine erkundbare Orbitalstation, Echtzeit-VR und echte Geld- und/oder In-Game-Belohnungen in einem einzigen Erlebnis. Der Kampfring allein fügt eine Gameplay-Dimension hinzu, die Konkurrenten nicht erreichen können. Wenn du das mit Bodenkampf, Weltraumkämpfen, VR-Immersion und dem vernetzten Hyper-Tek-Ökosystem kombinierst, steht Overlord in einer eigenen Kategorie."
                }
            ]
        },
        "upgradesTitle": "Wiederaufbauen, Wiederaufrüsten, Rekrutieren – Für den Krieg hochrüsten",
        "upgrades": [
            {
                "title": "Raumschiff-Upgrades",
                "body": "Dein abgestürztes Schiff ist der Ausgangspunkt. Baue es System für System wieder auf, vom Maschinenraum bis zum Kommandodeck. Jede Komponente ist vollständig aufwertbar: Hüllenverstärkung, Strukturintegrität, Außenhüllenkomposition, Schildgeneratoren, Energiesysteme und Navigationsarrays. In Overlord baust du nicht für Geschwindigkeit, sondern für den Kampf. Ein vollständig aufgerüstetes Kriegsschiff ist das Fundament jeder erfolgreichen Kampagne, und je tiefer du investierst, desto beeindruckender wird dein Gefährt."
            },
            {
                "title": "Waffensysteme und Tech-Level",
                "body": "Upgrade und verfeinere deine Waffen, Fähigkeiten und Tech-Level, um auf allen drei Kampfebenen zu dominieren. Bodengestützte Artillerie für planetare Kriegsführung, Anti-Orbital-Batterien für Boden-gegen-Weltraum-Angriffe und schiffsgebundene Waffen-Arrays für Weltraum-gegen-Weltraum-Kampf. Jedes Waffensystem kann für spezifische taktische Rollen verfeinert werden. Ob du dich auf Langstreckenbombardement, Nahkampfenteraktionen oder defensive Gegenmaßnahmen spezialisierst – dein Waffen-Loadout definiert deine Kampfidentität."
            },
            {
                "title": "Rekrutiere Spezialisten",
                "body": "Spezialisten sind die Kraftmultiplikatoren, die gute Spieler von Overlords unterscheiden. Erwerbe einzigartige Spezialisten, die mächtige Boni auf die Gesamtleistung und den Kraftlevel deines Schiffes bringen. Taktische Spezialisten verbessern die Effizienz des Truppeneinsatzes, Ingenieurspezialisten beschleunigen Schiffsreparaturen und -upgrades, Waffenspezialisten erhöhen den Schadensoutput aller Systeme, und Geheimdienstspezialisten enthüllen feindliche Positionen und Schwachstellen. Stapele mehrere Spezialisten, um verheerende Synergien zu schaffen, die jeden Aspekt deiner Operation verstärken."
            },
            {
                "title": "Baue deine Armeen auf",
                "body": "Klone Truppen in den Bord-Klonlaboren deines Schiffes, dann upgrade und verfeinere sie und ihre Waffen, bis sie kampfbereit sind. Doch Truppen allein reichen nicht aus. Zähme und trainiere die Wildtiere des Planeten, um beritten Bestien-Kavallerie zu schaffen – eine Truppe, die nicht geklont oder hergestellt werden kann und durch Können und Geduld verdient werden muss. Deine Armeekomposition über Boden, Luft und Weltraum hinweg bestimmt deine Dominanz."
            }
        ],
        "rewardsTitle": "Die Hammerongs, Belohnungen und das Hyper-Tek-Ökosystem",
        "rewards": [
            {
                "title": "Die Hammerongs: Die mächtigste Spezies aller Zeiten",
                "body": "Alle zwei Wochen fallen die Kraftfelder der Zentralarena, und die Hammerongs kommen. Sie sind die stärkste Alienspezies im Universum, ausgerüstet mit fortschrittlicher Technologie, die weit über das hinausgeht, was Spieler besitzen. Sie kommen, um die Ressourcen des Planeten auszubeuten, und verteidigen die Arena mit voller, überwältigender Macht. Den Hammerongs anzugreifen ist die gefährlichste Herausforderung in Overlord, aber wer erfolgreich ist, wird mit enormen Boni, legendärer Beute, seltenen Upgrade-Materialien und exklusiven Belohnungen belohnt, die auf keinem anderen Weg zu erhalten sind. Die zweiwöchentliche Hammerong-Invasion ist der ultimative Test deiner Macht."
            },
            {
                "title": "Tägliche Events, Quests und Kampfbelohnungen",
                "body": "Overlord liefert ständig Belohnungen. Schließe tägliche Aufgaben ab, um Credits, Upgrade-Materialien und Fortschrittsboni zu verdienen. Nimm an Spezialevents für Premium-Belohnungen teil. Führe Quests über die Oberfläche des Planeten und innerhalb des Kampfrings durch, um exklusive Beute zu erhalten. Gewinne Kämpfe gegen Monster, Alien-Kreaturen und gegnerische Spieler, um Ressourcen anzuhäufen. Erkunde die Oberfläche, um verborgene Artefakte und Schätze zu entdecken. Die Belohnungsstruktur ist so konzipiert, dass jede Aktion, die du unternimmst, dich dem Ziel näherbringt, der ultimative Overlord des Servers zu werden."
            },
            {
                "title": "Verbunden mit dem Hyper-Tek-Ökosystem",
                "body": "Overlord der 7 Reiche existiert nicht isoliert. Es ist vollständig in das Hyper-Tek-Universum neben Hyper Racing und Hyper Quest integriert. In Overlord verdiente Ressourcen können in allen drei Spielen verwendet werden. Schiffs-Upgrades, Spezialisten-Boni, Kampffähigkeiten und Materialien fließen nahtlos zwischen den Titeln. Renneigenschaften aus Hyper Racing verbessern deine Pilotenfähigkeiten im Overlord-Weltraumkampf. In Hyper Quest gesammelte Materialien treiben deine Upgrades auf dem Planeten an. Der Hyper-Tek-Marktplatz verbindet alles und schafft eine einheitliche Wirtschaft, in der Fortschritt in einem Spiel den Vorschritt in allen dreien antreibt."
            },
            {
                "title": "Ein Universum, drei Spiele, unbegrenzte Macht",
                "body": "Spieler, die sich in allen drei Hyper-Tek-Spielen engagieren, bauen Macht schneller auf, haben Zugang zu exklusiven spielübergreifenden Belohnungen und dominieren durch eine Bandbreite an Fähigkeiten und Ressourcen, die Einzelspieler nicht erreichen können. Das vernetzte Ökosystem ist der ultimative Wettbewerbsvorteil."
            }
        ],
        "faqTitle": "Overlord der 7 Reiche — Häufig gestellte Fragen",
        "faq": [
            {
                "q": "Was ist Overlord der 7 Reiche?",
                "a": "Ein dreidimensionales Kampfstrategiespiel, bei dem du auf einem fremden Planeten notlandest, dein Schiff wieder aufbaust, Armeen klonst und über drei Dimensionen hinweg kämpfst: Boden-gegen-Boden, Boden-gegen-Weltraum und Weltraum-gegen-Weltraum. Bietet VR-Interaktion, echte Bargeldbelohnungen und zweiwöchentliche Hammerong-Invasionen."
            },
            {
                "q": "Was ist das dreistufige Kampfsystem?",
                "a": "Kämpfe operieren auf drei Ebenen: Boden-gegen-Boden gegen Monster und gegnerische Spieler, Boden-gegen-Weltraum-Angriffe auf orbitale Schiffe und Weltraum-gegen-Weltraum-Kriegsführung auf dem Kampfring. Dieser mehrdimensionale Ansatz schafft taktische Tiefe, die kein Einzelebenenstrategy-Spiel erreichen kann."
            },
            {
                "q": "Was ist der Kampfring?",
                "a": "Eine massive Orbitalstruktur, die den Planeten umkreist. Lande dein Schiff dort, um ungeschützte Ziele zu jagen, Enterkommandos in feindliche Schiffe zu schicken und versteckte Quests in seinem Inneren zu erkunden. Die Kontrolle über den Kampfring gibt dir einen strategischen Vorteil gegenüber reinen Bodenspielern."
            },
            {
                "q": "Kann ich mein Raumschiff upgraden?",
                "a": "Jedes System ist aufwertbar – vom Maschinenraum bis zum Kommandodeck: Hülle, Struktur, Außenhülle, Schildgeneratoren, Energiesysteme und Navigation. In Overlord baust du für den Kampf, nicht für Geschwindigkeit. Ein vollständig aufgerüstetes Kriegsschiff ist das Fundament jeder Kampagne."
            },
            {
                "q": "Wie funktionieren Spezialisten?",
                "a": "Rekrutiere einzigartige Spezialisten, die mächtige Boni auf die Leistung und den Kraftlevel deines Schiffes hinzufügen. Taktische, Ingenieur-, Waffen- und Geheimdienstspezialisten stärken jeweils verschiedene Systeme. Stapele mehrere Spezialisten für verheerende Synergien auf allen Kampfebenen."
            },
            {
                "q": "Wer sind die Hammerongs?",
                "a": "Die mächtigste Alienspezies aller Zeiten. Alle zwei Wochen kommen sie in der Zentralarena an, um die Ressourcen des Planeten auszubeuten – geschützt von überwältigender Macht und fortschrittlicher Technologie. Sie anzugreifen ist äußerst gefährlich, belohnt Spieler aber mit enormen Boni und legendärer Beute."
            },
            {
                "q": "Welche Belohnungen kann ich verdienen?",
                "a": "Tägliche Aufgaben, Quests, Kämpfe und Events zahlen alle Credits, Upgrade-Materialien und Fortschrittsboni aus. Spezialevents und Hammerong-Invasionen bieten Premium- und exklusive Belohnungen. Höherschwierige Herausforderungen und Ranglistenwettbewerbe liefern größere Auszahlungen, einschließlich echtes Geld."
            },
            {
                "q": "Unterstützt Overlord VR?",
                "a": "Ja. Vollständige Echtzeit-VR-Interaktion ermöglicht es dir, die Korridore deines Schiffes zu betreten, das Innere des Kampfrings zu erkunden, Truppen in den Bodenkampf zu führen und dein Gefährt im Weltraumkampf zu pilotieren. VR verwandelt Overlord von Strategie in ein vollständig immersives Schlachterlebnis."
            },
            {
                "q": "Wie baue ich meine Armee auf?",
                "a": "Klone Truppen in den Bord-Laboren deines Schiffes, dann upgrade und verfeinere sie und ihre Waffen. Für beritten Kavallerie musst du die Wildtiere des Planeten zähmen und trainieren, da Tiere nicht geklont werden können. Die Armeekomposition über Boden, Luft und Weltraum hinweg bestimmt deine Dominanz."
            },
            {
                "q": "Kann ich einer Allianz beitreten?",
                "a": "Ja. Kämpfe alleine oder tritt einer Allianz bei, die deine Macht steigert und dir beim Wachstum hilft. Allianzen bieten gemeinsame Ressourcen, koordinierte Angriffe und kollektive Verteidigung. Schließe tägliche Aufgaben ab, um sowohl dein Schiff als auch die gemeinsamen Ressourcen der Allianz aufzuwerten."
            },
            {
                "q": "Ist Overlord mit anderen Hyper-Tek-Spielen verknüpft?",
                "a": "Vollständig integriert. Ressourcen, Schiffs-Upgrades, Spezialisten-Boni und Kampffähigkeiten fließen zwischen Overlord, Hyper Racing und Hyper Quest. Renneigenschaften verbessern deinen Weltraumkampf, Quest-Materialien treiben deine Upgrades an, und der Hyper-Tek-Marktplatz verbindet die gesamte Wirtschaft."
            },
            {
                "q": "Welche Waffen sind verfügbar?",
                "a": "Bodengestützte Artillerie, Anti-Orbital-Batterien, schiffsgebundene Waffen-Arrays und spezialisierte Enterausrüstung. Jedes System kann für spezifische taktische Rollen verfeinert werden, darunter Langstreckenbombardement, Nahkampf und defensive Gegenmaßnahmen."
            },
            {
                "q": "Kann ich die Planetenoberfläche erkunden?",
                "a": "Ja. Der Planet ist reich an verborgenen Belohnungen, Artefakten, Ressourcen und gefährlichen Wildtieren zum Zähmen. Erkunde die Oberfläche, um Schätze zu finden, Alien-Kreaturen und Monster zu bekämpfen und strategische Vorteile zu entdecken, die deine Kampagne zur Overlord-Dominanz stärken."
            }
        ]
    }
}


# ---------------------------------------------------------------------------
# 2.  FRENCH TRANSLATION  (gamePage only)
# ---------------------------------------------------------------------------

GAME_PAGE_FR = {
    "welcomeTo": "Bienvenue dans",
    "back": "Retour",
    "racing": {
        "label": "RACING",
        "heading": "Hyper Racing",
        "subtitle": "L'expérience de course de véhicules volants la plus intense de la galaxie,\noù le talent est récompensé et les champions sont forgés.",
        "intro": [
            "Hyper Racing est un jeu de course compétitif à haute tension se déroulant à travers des mondes extraterrestres, où les joueurs construisent, améliorent et pilotent des véhicules de course volants entièrement personnalisables à travers certains des circuits les plus dangereux de la galaxie. Des formations rocheuses flottantes et tubes de lave volcaniques aux étendues désertiques et cols de montagne, chaque course est une épreuve de préparation, de réflexes et de stratégie.",
            "Mais Hyper Racing est bien plus qu'un simple jeu ; c'est une plateforme compétitive où de vraies récompenses sont en jeu. Les meilleurs joueurs peuvent participer à des événements classés et des tournois avec de véritables pools de prix en argent réel. Mieux tu pilotes, plus tu gagnes. Que tu chasses la gloire du classement ou que tu construises un empire du racing, tout ce que tu fais dans Hyper Racing te fait avancer.",
            "Améliore ton véhicule de course de la proue à la poupe. Recrute et fais progresser ton équipe de stand. Engage un directeur de stand qui correspond à ta philosophie de course. Puis emmène tes compétences au-delà de la piste — ton garage de course sert également de hangar pour ton vaisseau spatial personnel, et chaque compétence que tu développes se prolonge dans le combat spatial de Hyper Quest et d'Overlord des 7 Royaumes."
        ],
        "introClose": "Lis la suite pour découvrir comment fonctionne le jeu, ce que tu peux gagner et comment ta carrière de course propulse tout un univers de progression.",
        "calloutLine1": "Course pour Gagner. Gagne pour Améliorer.",
        "calloutLine2": "Améliore pour Dominer.",
        "howItWorksTitle": "Comment fonctionne Hyper Racing",
        "howItWorks": [
            {
                "num": "01",
                "title": "Choisis ton véhicule",
                "body": "Chaque course commence dans ton garage. Choisis parmi un nombre croissant de véhicules de course volants, chacun avec des caractéristiques de maniabilité uniques et un potentiel d'amélioration. Dépouille une coque pour une vitesse en ligne droite fulgurante ou blindez-la pour survivre aux conditions les plus brutales. Propulseurs, stabilisateurs, boucliers, systèmes de refroidissement, ailerons aérodynamiques — l'arbre d'amélioration est profond, et chaque modification change le comportement de ton engin sur la piste."
            },
            {
                "num": "02",
                "title": "Constitue ton équipe",
                "body": "La course est un sport d'équipe. Recrute des spécialistes d'équipe de stand qui apportent des bonus uniques : ravitaillement plus rapide, diagnostics en temps réel, réparations d'urgence en pleine course et optimisations de performance entre les tours. Chaque membre de l'équipe progresse avec l'expérience, accumulant de puissantes capacités par-dessus tes améliorations de véhicule. Engage ensuite un directeur de stand pour coordonner les opérations, définir la stratégie de course et débloquer des bonus de performance à l'échelle de l'équipe qui s'accumulent sur toute une saison."
            },
            {
                "num": "03",
                "title": "Course à travers les mondes",
                "body": "Les circuits s'étendent sur des planètes extraterrestres avec des terrains et des dangers atmosphériques radicalement différents. Slalome à travers des formations rocheuses flottantes style Avatar, file à toute vitesse dans des tubes de lave volcaniques, dévale des plaines désertiques infinies et trace ta route à travers des chaînes de montagnes périlleuses. Pluie acide, atmosphères radioactives, gravité variable et vents turbulents — aucune course ne demande la même configuration. Adapter ton véhicule à chaque environnement, c'est là que la stratégie rencontre le talent."
            },
            {
                "num": "04",
                "title": "Grimpe dans les classements",
                "body": "Les victoires rapportent des points de classement, débloquent de nouveaux circuits sur des mondes lointains et ouvrent les portes à des compétitions de niveau supérieur. Plus tu progresses, plus les adversaires sont redoutables et plus les enjeux sont élevés. Prouve-toi sur chaque planète et monte dans le classement mondial."
            }
        ],
        "rewardsTitle": "Gagne gros — Des récompenses qui comptent !",
        "rewards": [
            {
                "title": "Récompenses en jeu",
                "body": "Chaque course que tu termines est payante. Gagne, et les récompenses se multiplient. Les victoires en course débloquent des composants de véhicule premium, des matériaux d'amélioration rares, des jetons exclusifs de recrutement d'équipage et des crédits pour financer ta prochaine construction. Vends des véhicules améliorés avec profit, réinvestis dans de nouvelles machines et regarde ton empire du racing grandir à chaque podium."
            },
            {
                "title": "Événements en argent réel",
                "body": "Hyper Racing porte la compétition au niveau supérieur avec des événements classés et des tournois où de l'argent réel est en jeu. Participe à des compétitions basées sur le talent, prouve tes capacités contre les meilleurs pilotes de la galaxie et repars avec de vrais gains en argent. Plus tu es bien classé, plus le pool de prix est important. Des défis classés hebdomadaires aux événements de championnat saisonniers, les meilleurs ont toujours des occasions de transformer leurs compétences en revenus réels."
            },
            {
                "title": "Comment fonctionnent les événements à prix",
                "body": "Les joueurs se qualifient par des parties classées, atteignant des seuils de performance qui donnent accès aux tournois avec prix en argent. Les événements sont structurés autour d'un matchmaking équitable, garantissant que chaque concurrent affronte des adversaires de niveau similaire. Les frais d'inscription sont transparents, les pools de prix sont clairement affichés avant que tu t'engages, et les paiements sont traités rapidement après la conclusion de chaque événement. C'est compétitif, c'est équitable et les récompenses sont réelles."
            },
            {
                "title": "Progression au-delà de la piste",
                "body": "Les récompenses gagnées en course alimentent directement ta progression globale. Améliore tes véhicules de course, renforce ton équipe de stand et canalize tes gains vers l'amélioration de ton vaisseau principal. Ton garage de course est la soute de hangar de ce vaisseau, donc chaque amélioration de ton opération de course alimente également le vaisseau avec lequel tu voles entre les mondes et dans le combat spatial de Hyper Quest et d'Overlord des 7 Royaumes."
            }
        ],
        "upgradesTitle": "Deux machines, une mission… Améliore tout",
        "upgrades": [
            {
                "title": "Améliorations du véhicule de course",
                "body": "Ton véhicule de course est une machine entièrement modulaire. Chaque composant peut être échangé, réglé et amélioré : coques, propulseurs, boucliers, coques externes, moteurs, stabilisateurs, systèmes de refroidissement et surfaces aérodynamiques. Les composites légers offrent une vitesse brute ; l'armure lourde te maintient en vie à travers les conditions atmosphériques brutales. Le chemin d'amélioration est profond, et les choix que tu fais définissent ton identité de pilote. Achète de nouveaux véhicules, transforme-les en prétendants au championnat, mène-les à la victoire et vends-les avec profit quand tu es prêt pour le prochain défi."
            },
            {
                "title": "Améliorations du vaisseau principal",
                "body": "Ton garage de course n'est pas seulement un atelier ; c'est la soute de hangar de ton vaisseau spatial personnel. Les mêmes ressources, crédits et matériaux que tu gagnes sur la piste peuvent être investis dans l'amélioration de ton vaisseau principal. De meilleurs moteurs pour les voyages interplanétaires, des systèmes d'armes plus puissants pour le combat spatial, une navigation améliorée pour découvrir de nouveaux mondes de course, et des coques renforcées pour survivre aux rencontres hostiles en transit. Ton vaisseau est ta base d'accueil, ton transport et ton cuirassé — et la course le rend plus fort."
            },
            {
                "title": "La boucle d'amélioration",
                "body": "Course pour gagner. Gagne pour améliorer. Améliore pour gagner de plus grandes courses avec de plus grandes récompenses. Canalise ces récompenses dans tes véhicules de course et ton vaisseau. Meilleur est ton vaisseau, plus loin tu voyages et plus dangereux et lucratifs deviennent les circuits. C'est une boucle de progression qui récompense le dévouement et le talent à chaque niveau."
            },
            {
                "title": "Impact inter-jeux",
                "body": "Chaque compétence de pilote que tu développes sur la piste et chaque amélioration que tu installes sur ton vaisseau se prolongent directement dans Hyper Quest et Overlord des 7 Royaumes. Un univers, plusieurs jeux, progression transparente. Ce que tu construis dans Hyper Racing alimente tout le reste."
            }
        ],
        "faqTitle": "Hyper Racing — Questions fréquemment posées",
        "faq": [
            {
                "q": "Qu'est-ce que Hyper Racing ?",
                "a": "Un jeu de course de véhicules volants haute intensité se déroulant sur des mondes extraterrestres. Construis, améliore et pilote des véhicules entièrement personnalisables à travers des circuits sci-fi dangereux tout en concourant pour des récompenses en jeu et de vrais prix en argent."
            },
            {
                "q": "Puis-je améliorer mon véhicule de course ?",
                "a": "Chaque composant est améliorable : coques, propulseurs, boucliers, coques externes, moteurs, stabilisateurs, systèmes de refroidissement et surfaces aérodynamiques. Chaque amélioration change la façon dont ton véhicule gère les différentes pistes et conditions."
            },
            {
                "q": "Que fait l'équipe de stand ?",
                "a": "Les membres de l'équipe de stand fournissent des bonus uniques : ravitaillement plus rapide, diagnostics de coque, réparations d'urgence et optimisations de performance entre les tours. Ils progressent avec le temps, débloquant des capacités plus puissantes qui s'accumulent avec les améliorations de véhicule."
            },
            {
                "q": "Comment fonctionne le directeur de stand ?",
                "a": "Le directeur de stand coordonne les opérations de l'équipage, définit la stratégie de course et débloque des bonus de performance à l'échelle de l'équipe. Les directeurs défensifs protègent ton véhicule dans les conditions difficiles ; les directeurs agressifs poussent chaque système à la vitesse maximale."
            },
            {
                "q": "Puis-je gagner de l'argent réel ?",
                "a": "Oui. Les événements classés et les tournois mettent en jeu de véritables pools de prix en argent. Qualifie-toi par des parties classées, affronte des adversaires de niveau similaire et gagne de vrais paiements basés sur ta position finale. Les défis hebdomadaires et les championnats saisonniers se déroulent en continu."
            },
            {
                "q": "Comment fonctionnent les récompenses de course ?",
                "a": "Chaque course paye des crédits, des matériaux d'amélioration et des jetons d'équipage. Les victoires multiplient tes gains. Achète des véhicules, améliore-les en machines de course, gagne des courses et vends-les avec profit pour financer d'autres améliorations et upgrades de vaisseau."
            },
            {
                "q": "Puis-je améliorer mon vaisseau principal aussi ?",
                "a": "Absolument. Ton garage de course est la soute de hangar de ton vaisseau. Les gains de course financent des améliorations des moteurs, des armes, de la navigation et du renforcement de la coque de ton vaisseau principal, boostant les voyages interplanétaires et le combat spatial."
            },
            {
                "q": "La progression se transfère-t-elle à d'autres jeux ?",
                "a": "Chaque compétence de pilote et amélioration de vaisseau se transfère directement dans Hyper Quest et Overlord des 7 Royaumes. Un univers, plusieurs jeux, progression transparente. Ce que tu construis dans Hyper Racing alimente tout le reste."
            },
            {
                "q": "Quels environnements de course y a-t-il ?",
                "a": "Les circuits s'étendent sur des formations rocheuses flottantes, tubes de lave, plaines désertiques et chaînes de montagnes sur des mondes extraterrestres. Les dangers atmosphériques comprennent la pluie acide, les atmosphères radioactives, la gravité variable et les vents turbulents. Chaque circuit exige des configurations de véhicule différentes."
            }
        ]
    },
    "quest": {
        "label": "QUEST",
        "heading": "Hyper Quest",
        "subtitle": "Ta galaxie. Tes règles. Ta fortune.",
        "intro": [
            "Hyper Quest est une aventure spatiale en monde ouvert où tu commandes ton propre vaisseau spatial entièrement améliorable — le Quest Racer — à travers une galaxie vaste et dangereuse. Tu as quitté ta civilisation natale il y a des années en quête de pouvoir, de richesse et de gloire. Maintenant, tout l'univers est ton terrain de jeu, et chaque quête que tu complètes te rapproche de la domination galactique.",
            "Mais Hyper Quest n'est pas seulement un jeu. C'est une plateforme compétitive où de l'argent réel est en jeu. Accomplis des quêtes, surmonte des défis et repars avec de l'argent réel et/ou des récompenses en poche. Des missions rapides qui prennent des minutes aux épopées de plusieurs jours, chaque quête est payante. Plus le défi est difficile, plus la récompense est grande.",
            "Améliore ton vaisseau de la coque au cockpit. Armez-le avec des systèmes d'armes dévastateurs. Recrute des spécialistes qui accumulent de puissants bonus sur les performances et le niveau de puissance de ton vaisseau. Mine des astéroïdes, transporte des cargaisons dangereuses, chasse des trésors cachés, kidnappe des cibles de grande valeur ou deviens un mercenaire. Comment tu gouvernes l'univers dépend entièrement de toi.",
            "Tout ce que tu construis dans Hyper Quest alimente directement Hyper Racing et Overlord des 7 Royaumes. Un univers, progression transparente, potentiel illimité. Lis la suite pour découvrir comment la quête fonctionne, ce que tu peux gagner et comment toi et ton vaisseau devenez le vaisseau le plus redouté de la galaxie."
        ],
        "calloutLine1": "Quête pour Gagner. Gagne pour Améliorer.",
        "calloutLine2": "Améliore pour Conquérir.",
        "howItWorksTitle": "Comment fonctionne Hyper Quest",
        "howItWorks": [
            {
                "num": "01",
                "title": "Accepte des quêtes du tableau de missions",
                "body": "Le tableau de quêtes en jeu est ta porte vers l'aventure. Parcours les missions disponibles — des courses de cargo rapides qui prennent quelques minutes aux épiques expéditions de plusieurs jours dans l'espace inexploré. Chaque quête vient avec des objectifs clairs, des évaluations de danger et des niveaux de récompense. Choisis les missions qui correspondent à ton style de jeu — que ce soit transporter des cargaisons dangereuses, chasser des trésors cachés, exploiter des champs d'astéroïdes ou infiltrer une mission pour récupérer des artefacts perdus."
            },
            {
                "num": "02",
                "title": "Explore la galaxie",
                "body": "Voyage à travers des portails vers des planètes lointaines, chacune avec des environnements uniques, des matériaux précieux et de nouveaux circuits de course. Suis des cartes galactiques pour cartographier des régions inexplorées et gagner des droits de nommage pour les planètes que tu découvres en premier. Exploite des ressources dans des champs d'astéroïdes, récupère des pièces d'anciennes reliques et de vaisseaux abandonnés, et rassemble des indices menant à des fortunes cachées dispersées à travers les étoiles."
            },
            {
                "num": "03",
                "title": "Construis ton empire depuis ton vaisseau",
                "body": "Ton Quest Racer est plus qu'un simple transport. Cultive de la nourriture dans des baies hydroponiques, raffine des matériaux extraits de planètes lointaines et construis des armées dans tes laboratoires de clonage. Affine tes troupes et leurs armes, défends-toi contre les pirates et gère une base mobile autosuffisante qui devient plus puissante à chaque mission accomplie."
            },
            {
                "num": "04",
                "title": "Joue à ta façon",
                "body": "Il n'existe pas de chemin unique vers la domination. Deviens un chasseur de primes redouté, un contrebandier rusé, un maître mineur ou un explorateur légendaire. Kidnappe des cibles de grande valeur, deviens mercenaire ou forge des alliances pour contrôler des secteurs entiers. La galaxie se plie à ta volonté, et chaque décision façonne ta réputation et ta fortune."
            }
        ],
        "rewardsTitle": "Récompenses de quête — Sois payé pour jouer !",
        "rewards": [
            {
                "title": "Récompenses en jeu",
                "body": "Chaque quête que tu accomplis paye. Des crédits, des matériaux d'amélioration, des composants rares, des jetons de recrutement de spécialistes et des objets exclusifs affluent dans ton inventaire à chaque mission réussie. Plus la quête est difficile, plus le butin est riche. Découvre des matériaux rares sur des planètes lointaines, récupère des pièces de grande valeur d'anciennes reliques et stocke des ressources qui alimentent ton ascension vers la suprématie galactique."
            },
            {
                "title": "Paiements en argent réel",
                "body": "Hyper Quest porte le jeu au-delà du divertissement. Certaines quêtes et défis classés offrent de vrais paiements en argent. Accomplis des missions de haut niveau, domine les événements de classement et participe aux championnats de quêtes saisonniers où de l'argent réel est en jeu. Plus tu deviens habile et audacieux, plus les gains sont importants. Des primes de quête hebdomadaires aux tournois épiques saisonniers, il y a toujours des occasions de transformer tes aventures galactiques en revenus réels."
            },
            {
                "title": "Comment fonctionnent les paiements de quête",
                "body": "Les joueurs se qualifient pour des quêtes à récompenses en espèces en construisant leur réputation et en atteignant des seuils de performance. La difficulté, la durée et le niveau de danger de la quête déterminent le pool de prix. Les paiements sont transparents, clairement affichés avant que tu acceptes une mission, et traités rapidement à la completion. Que tu effectues un transport de cargo de dix minutes ou une expédition d'une semaine dans l'espace profond, les récompenses correspondent au risque."
            },
            {
                "title": "Une progression qui paie en avant",
                "body": "Les récompenses de quête alimentent directement tes améliorations de vaisseau, systèmes d'armes et recrutement de spécialistes. Chaque paiement te rend plus fort, ce qui débloque des quêtes plus difficiles avec des récompenses encore plus grandes. Les gains se prolongent également dans Hyper Racing et Overlord des 7 Royaumes, créant une boucle de progression qui récompense le dévouement à travers tout l'écosystème Hyper Tek."
            }
        ],
        "upgradesTitle": "Améliore ton vaisseau, arme ton arsenal, recrute ton équipage",
        "upgrades": [
            {
                "title": "Améliorations du vaisseau",
                "body": "Ton Quest Racer est entièrement modulaire de la baie moteur au cockpit. Améliore la coque pour une durabilité maximale, renforce la coque externe pour résister aux environnements hostiles, booste les générateurs de boucliers pour la survie en combat et révise les systèmes d'alimentation pour des performances optimales. De meilleurs moteurs signifient des voyages interplanétaires plus rapides. Des systèmes de navigation plus puissants révèlent des routes cachées et des mondes inexplorés. Chaque amélioration transforme ton vaisseau en un engin plus puissant et plus redouté."
            },
            {
                "title": "Systèmes d'armes",
                "body": "La galaxie est dangereuse, et tu dois être encore plus dangereux. Améliore et affine tes systèmes d'armes pour te protéger contre les pirates, les joueurs adverses et les forces hostiles. Choisis entre des configurations défensives qui te maintiennent en vie dans les pires situations ou des configurations offensives conçues pour infliger un maximum de dégâts. Réseaux laser, batteries de missiles, canons à plasma et armes à énergie expérimentales sont tous disponibles au fil de ta progression dans l'arbre d'amélioration."
            },
            {
                "title": "Recrute des spécialistes",
                "body": "Les spécialistes changent la donne. Chacun apporte des compétences uniques qui ajoutent de puissants bonus aux performances globales et au niveau de puissance de ton vaisseau. Les spécialistes en navigation révèlent des chemins cachés et réduisent le temps de voyage. Les spécialistes en combat boostent la précision des armes et les dégâts. Les spécialistes en ingénierie augmentent l'intégrité de la coque et la vitesse de réparation. Les spécialistes en sciences améliorent l'extraction de ressources et le raffinage des matériaux. Cumule plusieurs spécialistes pour créer des combinaisons dévastatrices qui multiplient l'efficacité de ton vaisseau."
            },
            {
                "title": "La boucle de puissance",
                "body": "Quête pour gagner. Gagne pour améliorer. Améliore pour conquérir des quêtes plus difficiles avec de plus grandes récompenses. Recrute des spécialistes pour amplifier chaque système de ton vaisseau. Plus tu deviens fort, plus la galaxie s'ouvre à toi et plus grande est la fortune qui t'attend. Les améliorations de vaisseau et les bonus de spécialistes se prolongent également directement dans le combat spatial pendant le transit de Hyper Racing et les batailles d'Overlord des 7 Royaumes."
            }
        ],
        "faqTitle": "Hyper Quest — Questions fréquemment posées",
        "faq": [
            {
                "q": "Qu'est-ce que Hyper Quest ?",
                "a": "Une aventure spatiale en monde ouvert où tu commandes un vaisseau entièrement améliorable à travers une vaste galaxie. Accomplis des quêtes, explore des mondes extraterrestres, améliore ton vaisseau, recrute des spécialistes et gagne de vraies récompenses en argent en plus des richesses en jeu."
            },
            {
                "q": "Comment fonctionnent les quêtes ?",
                "a": "Accepte des missions du tableau de quêtes en jeu. Les quêtes vont de simples courses de cargo ne prenant que quelques minutes à d'épiques expéditions de plusieurs jours dans l'espace inexploré. Chaque quête a des objectifs clairs, des évaluations de danger et des niveaux de récompense affichés avant que tu acceptes."
            },
            {
                "q": "Puis-je gagner de l'argent réel ?",
                "a": "Oui. Certaines quêtes, défis classés et championnats saisonniers offrent de vrais paiements en argent. Construis ta réputation, atteins des seuils de performance et qualifie-toi pour des missions de récompenses en espèces de plus en plus lucratives. Les primes hebdomadaires et les tournois saisonniers se déroulent en continu."
            },
            {
                "q": "Quelles récompenses en jeu puis-je gagner ?",
                "a": "Chaque quête accomplie paye des crédits, des matériaux d'amélioration, des composants rares, des jetons de recrutement de spécialistes et des objets exclusifs. Plus la quête est difficile et longue, plus les récompenses sont riches. Découvre des matériaux rares sur des planètes lointaines et récupère des pièces de grande valeur d'anciennes reliques."
            },
            {
                "q": "Puis-je améliorer mon vaisseau ?",
                "a": "Chaque système est améliorable : coque, coque externe, générateurs de boucliers, systèmes d'alimentation, moteurs, cockpit et navigation. De meilleurs moteurs signifient des voyages plus rapides, des coques plus solides survivent aux rencontres hostiles, et une navigation améliorée révèle des routes cachées et des mondes inexplorés."
            },
            {
                "q": "Quelles armes sont disponibles ?",
                "a": "Améliore et affine les systèmes d'armes incluant réseaux laser, batteries de missiles, canons à plasma et armes à énergie expérimentales. Choisis des configurations défensives pour la survie ou des configurations offensives pour un maximum de dégâts contre les pirates, les adversaires et les forces hostiles."
            },
            {
                "q": "Comment fonctionnent les spécialistes ?",
                "a": "Recrute des spécialistes avec des compétences uniques qui ajoutent de puissants bonus aux performances et au niveau de puissance de ton vaisseau. Les spécialistes en navigation révèlent des chemins cachés, les spécialistes en combat boostent les dégâts, les spécialistes en ingénierie augmentent l'intégrité de la coque, et les spécialistes en sciences améliorent l'extraction de ressources. Cumule plusieurs spécialistes pour des combinaisons dévastatrices."
            },
            {
                "q": "Quels types de quêtes sont disponibles ?",
                "a": "Transport de cargo, exploitation minière d'astéroïdes, chasse au trésor, chasse aux primes, récupération d'artefacts, opérations d'infiltration, exploration planétaire, défense contre les pirates, missions de récupération et plus encore. Les quêtes vont de rapides courses de dix minutes à des expéditions de plusieurs jours dans l'espace profond."
            },
            {
                "q": "Puis-je découvrir de nouvelles planètes ?",
                "a": "Oui. Suis des cartes galactiques dans des régions inexplorées et découvre de nouveaux mondes. Les premiers découvreurs obtiennent des droits de nommage pour les planètes qu'ils trouvent. Les nouveaux mondes offrent des matériaux uniques, des environnements et des circuits de course auxquels aucun autre joueur n'a encore accédé."
            },
            {
                "q": "Que puis-je faire à l'intérieur de mon vaisseau ?",
                "a": "Ton Quest Racer est une base mobile. Cultive de la nourriture dans des baies hydroponiques, raffine des matériaux extraits de planètes lointaines, construis et entraîne des armées dans des laboratoires de clonage, améliore les armes et les défenses, et gère une opération autosuffisante qui devient plus puissante à chaque mission."
            },
            {
                "q": "Comment fonctionne la carte galactique ?",
                "a": "La carte galactique guide ton exploration à travers l'univers. Améliore ta carte pour révéler de nouveaux secteurs, emplacements de portails et zones de quêtes cachées. Plus tu explores loin, plus la carte s'étend, débloquant des régions de l'espace de plus en plus dangereuses et gratifiantes."
            },
            {
                "q": "Ma progression se transfère-t-elle à d'autres jeux ?",
                "a": "Tout ce que tu construis dans Hyper Quest alimente directement Hyper Racing et Overlord des 7 Royaumes. Les améliorations de vaisseau, les bonus de spécialistes, les compétences de combat et les ressources se transfèrent en douceur. Un univers, plusieurs jeux, progression illimitée."
            },
            {
                "q": "Puis-je jouer comme un vilain ?",
                "a": "Absolument. Infiltre des missions, kidnappe des cibles de grande valeur, deviens mercenaire, contrebande des cargaisons dangereuses ou raid d'autres joueurs. Il n'existe pas de chemin unique vers la domination. Comment tu gouvernes la galaxie dépend entièrement de toi, et chaque décision façonne ta réputation."
            }
        ]
    },
    "overlord": {
        "label": "OVERLORD",
        "heading": "Overlord des 7 Royaumes",
        "subtitle": "Atterrissage forcé. Reconstruction. Conquête. Deviens l'Overlord.",
        "intro": [
            "Overlord des 7 Royaumes est un jeu de stratégie de combat à trois niveaux sans équivalent dans le gaming. Tu t'es aventuré à travers un portail dans un univers parallèle et tu t'es écrasé sur une planète extraterrestre hostile. Ton vaisseau est détruit, tes systèmes défaillent et les créatures de la planète se rapprochent déjà. La survie n'est que le début. La domination est l'objectif.",
            "Reconstruis ton vaisseau à partir des débris. Clone et entraîne des armées dans tes laboratoires de bord. Apprivoise la faune de la planète pour créer une cavalerie montée dévastatrice. Puis porte le combat sur trois dimensions de bataille : le combat sol-sol contre les monstres et les joueurs adverses, les assauts sol-espace contre des cibles orbitales ou terrestres, et la guerre espace-espace à bord du massif Anneau de Combat qui orbite autour de la planète.",
            "Ce n'est pas juste un autre jeu de stratégie. Overlord propose une interaction VR en temps réel, de vraies récompenses en argent pour accomplir des événements et des quêtes quotidiens, et des invasions bimensuelles par les redoutables Hammerongs — l'espèce extraterrestre la plus puissante qui soit. Toutes les deux semaines, ils arrivent pour exploiter les ressources de la planète, et toutes les deux semaines, les joueurs courageux peuvent les défier pour des bonus massifs et des récompenses légendaires.",
            "Améliore ton vaisseau, arme-le avec des armes dévastatrices, recrute des spécialistes qui amplifies ton niveau de puissance et forge des alliances pour contrôler des régions entières. Tout ce que tu construis se connecte directement à Hyper Racing et Hyper Quest à travers l'écosystème partagé Hyper Tek. Un univers, trois jeux, guerres illimitées. Lis la suite pour découvrir comment fonctionne le système de combat et pourquoi Overlord change tout."
        ],
        "calloutLine1": "La survie n'est que le début.",
        "calloutLine2": "La domination est l'objectif.",
        "howItWorksTitle": "Le Système de Combat à Trois Niveaux — Trois Dimensions de Guerre",
        "howItWorks": [
            {
                "num": "01",
                "title": "Combat sol-sol",
                "body": "La surface de la planète est une zone de guerre. Déploie tes armées clonées contre des créatures extraterrestres hostiles, des bêtes monstrueuses et des joueurs adverses qui se battent pour le territoire et les ressources. Apprivoise et entraîne la faune de la planète pour créer des unités de cavalerie montée qui donnent à tes forces terrestres un avantage dévastateur. La guerre terrestre est brute, tactique et implacable. Chaque bataille gagnée rapporte des ressources, du territoire et de la réputation."
            },
            {
                "num": "02",
                "title": "Assauts sol-espace",
                "body": "C'est là qu'Overlord ajoute une dimension qu'aucun, ou presque aucun, autre jeu n'offre. Crée des groupes de troupes spécialisées conçues pour lancer des attaques entre la surface de la planète et l'Anneau de Combat orbital. Frappe les vaisseaux stationnés dans l'espace depuis ta position au sol ou coordonne des assauts combinés qui frappent les ennemis de dessus et dessous simultanément. Cette couche de combat vertical transforme la stratégie standard en un jeu d'échecs multidimensionnel où le positionnement à travers le sol et l'espace détermine la victoire."
            },
            {
                "num": "03",
                "title": "Guerre espace-espace",
                "body": "Téléporte ton vaisseau en orbite et atterris sur l'Anneau de Combat — une massive structure orbitale encerclant la planète. De là, chasse des vaisseaux non protégés et des cibles vulnérables. Téléporte des troupes à travers l'espace et directement dans les vaisseaux ennemis pour infliger un maximum de dommages internes en utilisant des attaques d'abordage spécialement développées. Les récompenses du combat spatial sont parmi les plus élevées du jeu, et contrôler le territoire orbital te donne un avantage stratégique qu'aucun joueur uniquement terrestre ne peut égaler."
            },
            {
                "num": "04",
                "title": "Pourquoi le système à trois niveaux change tout",
                "body": "La plupart des jeux de stratégie opèrent sur un seul plan. Overlord opère sur trois. La capacité d'attaquer de sol à sol, de sol à espace et d'espace à espace crée un champ de bataille avec une profondeur tactique inégalée. Le talent est tout. La force brute seule ne fera pas de toi l'Overlord. La maîtrise stratégique sur les trois niveaux est ce qui sépare les dominants des vaincus."
            }
        ],
        "extraSection": {
            "title": "L'Anneau de Combat et l'Interaction VR",
            "items": [
                {
                    "title": "Atterrir sur l'Anneau de Combat",
                    "body": "L'Anneau de Combat est une structure orbitale colossale qui encercle le système planétaire. Quand tu téléportes ton vaisseau dans l'espace, tu peux t'amarrer à l'Anneau de Combat pour gagner un avantage stratégique massif. Depuis cette position élevée, tu peux chasser des vaisseaux non protégés, envoyer des équipes d'abordage dans des vaisseaux adverses et coordonner des attaques dévastatrices sur les cibles terrestres en dessous. Atterrir sur l'Anneau de Combat ouvre une toute nouvelle dimension de gameplay que la plupart des jeux de stratégie n'offrent tout simplement pas — donnant à Overlord un avantage tactique sur tout autre jeu du marché."
                },
                {
                    "title": "À l'intérieur de l'Anneau de Combat",
                    "body": "L'Anneau de Combat n'est pas qu'une plateforme d'amarrage. Si tu peux découvrir comment brècher son intérieur, des quêtes cachées, des bonus supplémentaires et des récompenses exclusives t'y attendent. L'intérieur de l'anneau est un labyrinthe de couloirs, de chambres et de technologie ancienne. Accomplis des quêtes et des missions de chasse à l'intérieur de l'anneau lui-même, découvrant des secrets auxquels aucun joueur lié à la surface n'accédera jamais. L'Anneau de Combat récompense les audacieux, les rusés et les implacables."
                },
                {
                    "title": "Interaction VR en temps réel",
                    "body": "Comme tous les jeux de la gamme Hyper Tek, Overlord des 7 Royaumes supporte une interaction VR complète en temps réel. Entre dans ton vaisseau, parcours les couloirs de l'Anneau de Combat, mène tes troupes au combat terrestre et vis la guerre spatiale depuis le cockpit de ton vaisseau. La VR transforme Overlord d'un jeu de stratégie en une expérience de champ de bataille pleinement immersive. Commande tes forces, explore un terrain extraterrestre et engage le combat avec un niveau de présence et d'intensité que le jeu sur écran plat ne peut pas reproduire."
                },
                {
                    "title": "L'avantage sur les autres jeux",
                    "body": "Aucun autre jeu ne combine la guerre à trois niveaux, une station de bataille orbitale explorable, la VR en temps réel et de vraies récompenses en argent et/ou en jeu dans une seule expérience. L'Anneau de Combat seul ajoute une dimension de gameplay que les concurrents ne peuvent pas égaler. Quand tu combines ça avec le combat terrestre, la guerre spatiale, l'immersion VR et l'écosystème interconnecté Hyper Tek, Overlord se place dans une catégorie à part."
                }
            ]
        },
        "upgradesTitle": "Reconstruire, Réarmer, Recruter — Monter en puissance pour la guerre",
        "upgrades": [
            {
                "title": "Améliorations du vaisseau",
                "body": "Ton vaisseau écrasé, c'est par là que tout commence. Reconstruis-le système par système, de la baie moteur au pont de commandement. Chaque composant est entièrement améliorable : renforcement de la coque, intégrité structurelle, composition de la coque externe, générateurs de boucliers, systèmes d'alimentation et réseaux de navigation. Dans Overlord, tu construis non pas pour la vitesse mais pour la bataille. Un vaisseau de guerre entièrement amélioré est le fondement de chaque campagne réussie, et plus tu investis profondément, plus ton vaisseau devient redoutable."
            },
            {
                "title": "Systèmes d'armes et niveaux technologiques",
                "body": "Améliore et affine tes armes, compétences et niveaux technologiques pour dominer les trois niveaux de combat. Artillerie terrestre pour la guerre planétaire, batteries anti-orbitales pour les assauts sol-espace et réseaux d'armes montés sur vaisseau pour le combat espace-espace. Chaque système d'armes peut être affiné pour des rôles tactiques spécifiques. Que tu te spécialises dans le bombardement à longue portée, les actions d'abordage en corps à corps ou les contre-mesures défensives, ta configuration d'armes définit ton identité de combat."
            },
            {
                "title": "Recrute des spécialistes",
                "body": "Les spécialistes sont les multiplicateurs de force qui séparent les bons joueurs des Overlords. Acquiers des spécialistes uniques qui apportent de puissants bonus aux performances globales et au niveau de puissance de ton vaisseau. Les spécialistes tactiques améliorent l'efficacité du déploiement des troupes, les spécialistes en ingénierie accélèrent les réparations et améliorations du vaisseau, les spécialistes en armes augmentent les dégâts sur tous les systèmes, et les spécialistes en renseignement révèlent les positions et faiblesses ennemies. Cumule plusieurs spécialistes pour créer des synergies dévastatrices qui amplifient chaque aspect de ton opération."
            },
            {
                "title": "Construis tes armées",
                "body": "Clone des troupes dans les laboratoires de clonage de bord de ton vaisseau, puis améliore et affine-les ainsi que leurs armes jusqu'à ce qu'ils soient prêts au combat. Mais les troupes seules ne suffisent pas. Apprivoise et entraîne les créatures sauvages de la planète pour créer une cavalerie de bêtes montées — une force qui ne peut pas être clonée ou fabriquée et doit être gagnée par la compétence et la patience. Ta composition d'armée à travers le sol, l'air et l'espace détermine ta domination."
            }
        ],
        "rewardsTitle": "Les Hammerongs, Récompenses et l'Écosystème Hyper Tek",
        "rewards": [
            {
                "title": "Les Hammerongs : L'espèce la plus puissante qui soit",
                "body": "Toutes les deux semaines, les champs de force de l'arène centrale tombent et les Hammerongs arrivent. Ce sont les extraterrestres les plus puissants de l'univers, armés d'une technologie avancée bien au-delà de tout ce que les joueurs possèdent. Ils viennent exploiter les ressources de la planète et défendent l'arène avec une force pleine et écrasante. Attaquer les Hammerongs est le défi le plus dangereux d'Overlord, mais ceux qui réussissent sont récompensés par d'énormes bonus, du butin légendaire, des matériaux d'amélioration rares et des récompenses exclusives impossibles à obtenir autrement. L'invasion bimensuelle des Hammerongs est le test ultime de ta puissance."
            },
            {
                "title": "Événements quotidiens, quêtes et récompenses de combat",
                "body": "Overlord délivre des récompenses en permanence. Accomplis des tâches quotidiennes pour gagner des crédits, des matériaux d'amélioration et des bonus de progression. Entre dans des événements spéciaux pour des récompenses premium. Effectue des quêtes à travers la surface de la planète et à l'intérieur de l'Anneau de Combat pour du butin exclusif. Gagne des batailles contre des monstres, des créatures extraterrestres et des joueurs adverses pour accumuler des ressources. Explore la surface pour découvrir des artefacts et des trésors cachés. La structure de récompense est conçue de sorte que chaque action que tu entreprends te rapproche du statut d'Overlord ultime du serveur."
            },
            {
                "title": "Connecté à l'écosystème Hyper Tek",
                "body": "Overlord des 7 Royaumes n'existe pas en isolation. Il est entièrement intégré dans l'univers Hyper Tek aux côtés de Hyper Racing et Hyper Quest. Les ressources gagnées dans Overlord peuvent être utilisées dans les trois jeux. Les améliorations de vaisseau, les bonus de spécialistes, les compétences de combat et les matériaux circulent en douceur entre les titres. Les compétences de course acquises dans Hyper Racing améliorent tes compétences de pilote dans le combat spatial d'Overlord. Les matériaux collectés dans Hyper Quest alimentent tes améliorations sur la planète. La marketplace Hyper Tek connecte tout, créant une économie unifiée où le progrès dans un jeu propulse l'avancement dans les trois."
            },
            {
                "title": "Un univers, trois jeux, puissance illimitée",
                "body": "Les joueurs qui s'engagent dans les trois jeux Hyper Tek construisent la puissance plus vite, accèdent à des récompenses exclusives inter-jeux et dominent grâce à une étendue de compétences et de ressources que les joueurs d'un seul jeu ne peuvent pas égaler. L'écosystème interconnecté est l'avantage compétitif ultime."
            }
        ],
        "faqTitle": "Overlord des 7 Royaumes — Questions fréquemment posées",
        "faq": [
            {
                "q": "Qu'est-ce qu'Overlord des 7 Royaumes ?",
                "a": "Un jeu de stratégie de combat à trois niveaux où tu t'écrases sur une planète extraterrestre, reconstruis ton vaisseau, clones des armées et combats sur trois dimensions : sol-sol, sol-espace et espace-espace. Propose une interaction VR, de vraies récompenses en argent et des invasions bimensuelles des Hammerongs."
            },
            {
                "q": "Qu'est-ce que le système de combat à trois niveaux ?",
                "a": "Le combat opère sur trois niveaux : sol-sol contre les monstres et joueurs adverses, assauts sol-espace ciblant les vaisseaux orbitaux, et guerre espace-espace sur l'Anneau de Combat. Cette approche multidimensionnelle crée une profondeur tactique qu'aucun jeu de stratégie à un seul plan ne peut égaler."
            },
            {
                "q": "Qu'est-ce que l'Anneau de Combat ?",
                "a": "Une massive structure orbitale encerclant la planète. Atterris ton vaisseau dessus pour chasser des cibles non protégées, envoyer des équipes d'abordage dans des vaisseaux ennemis et accéder à des quêtes cachées à l'intérieur. Contrôler l'Anneau de Combat te donne un avantage stratégique sur les joueurs uniquement terrestres."
            },
            {
                "q": "Puis-je améliorer mon vaisseau ?",
                "a": "Chaque système est améliorable, de la baie moteur au pont de commandement : coque, structure, coque externe, générateurs de boucliers, systèmes d'alimentation et navigation. Dans Overlord, tu construis pour la bataille, pas la vitesse. Un vaisseau de guerre entièrement amélioré est le fondement de chaque campagne."
            },
            {
                "q": "Comment fonctionnent les spécialistes ?",
                "a": "Recrute des spécialistes uniques qui ajoutent de puissants bonus aux performances et au niveau de puissance de ton vaisseau. Les spécialistes tactiques, en ingénierie, en armes et en renseignement boostent chacun différents systèmes. Cumule plusieurs spécialistes pour des synergies dévastatrices à tous les niveaux de combat."
            },
            {
                "q": "Qui sont les Hammerongs ?",
                "a": "L'espèce extraterrestre la plus puissante qui soit. Toutes les deux semaines, ils arrivent à l'arène centrale pour exploiter les ressources de la planète, défendus par une force écrasante et une technologie avancée. Les attaquer est extrêmement dangereux mais récompense les joueurs avec d'énormes bonus et du butin légendaire."
            },
            {
                "q": "Quelles récompenses puis-je gagner ?",
                "a": "Les tâches quotidiennes, quêtes, batailles et événements paient tous des crédits, des matériaux d'amélioration et des bonus de progression. Les événements spéciaux et les invasions des Hammerongs offrent des récompenses premium et exclusives. Les défis de plus haute difficulté et les compétitions classées rapportent de plus grands paiements incluant de l'argent réel."
            },
            {
                "q": "Overlord supporte-t-il la VR ?",
                "a": "Oui. L'interaction VR complète en temps réel te permet de parcourir les couloirs de ton vaisseau, d'explorer l'intérieur de l'Anneau de Combat, de mener des troupes au combat terrestre et de piloter ton vaisseau dans la guerre spatiale. La VR transforme Overlord de stratégie en une expérience de champ de bataille pleinement immersive."
            },
            {
                "q": "Comment construire mon armée ?",
                "a": "Clone des troupes dans les laboratoires de bord de ton vaisseau, puis améliore et affine-les ainsi que leurs armes. Pour la cavalerie montée, tu dois apprivoiser et entraîner les créatures sauvages de la planète, car les animaux ne peuvent pas être clonés. La composition de l'armée à travers le sol, l'air et l'espace détermine ta domination."
            },
            {
                "q": "Puis-je rejoindre une alliance ?",
                "a": "Oui. Agis seul ou rejoins une alliance qui augmente ta puissance et t'aide à grandir. Les alliances offrent des ressources partagées, des attaques coordonnées et une défense collective. Accomplis des tâches quotidiennes pour améliorer à la fois ton vaisseau et les ressources partagées de l'alliance."
            },
            {
                "q": "Overlord est-il lié à d'autres jeux Hyper Tek ?",
                "a": "Entièrement intégré. Les ressources, améliorations de vaisseau, bonus de spécialistes et compétences de combat circulent entre Overlord, Hyper Racing et Hyper Quest. Les compétences de course améliorent ton combat spatial, les matériaux de Quest alimentent tes améliorations, et la marketplace Hyper Tek connecte toute l'économie."
            },
            {
                "q": "Quelles armes sont disponibles ?",
                "a": "Artillerie terrestre, batteries anti-orbitales, réseaux d'armes montés sur vaisseau et équipement spécialisé d'abordage. Chaque système peut être affiné pour des rôles tactiques spécifiques incluant le bombardement à longue portée, le combat rapproché et les contre-mesures défensives."
            },
            {
                "q": "Puis-je explorer la surface de la planète ?",
                "a": "Oui. La planète est riche en récompenses cachées, artefacts, ressources et faune dangereuse à apprivoiser. Explore la surface pour trouver des trésors, combattre des créatures extraterrestres et des monstres, et découvrir des avantages stratégiques qui renforcent ta campagne pour la domination d'Overlord."
            }
        ]
    }
}


# ---------------------------------------------------------------------------
# 3.  DEEP-MERGE HELPER
# ---------------------------------------------------------------------------

def deep_merge(base: dict, override: dict) -> dict:
    """
    Returns a new dict that is `base` deep-merged with `override`.
    Only keys MISSING from base are inserted; existing keys are left alone.
    """
    result = copy.deepcopy(base)
    for key, val in override.items():
        if key not in result:
            result[key] = copy.deepcopy(val)
        elif isinstance(result[key], dict) and isinstance(val, dict):
            result[key] = deep_merge(result[key], val)
        # else: key exists and is not a dict → leave base value untouched
    return result


# ---------------------------------------------------------------------------
# 4.  MAIN
# ---------------------------------------------------------------------------

def patch_file(path: str, new_section_key: str, new_section_value: dict) -> None:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if new_section_key not in data:
        data[new_section_key] = new_section_value
    else:
        data[new_section_key] = deep_merge(data[new_section_key], new_section_value)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")   # trailing newline


if __name__ == "__main__":
    de_path = os.path.join(LOCALES_DIR, "game-de.json")
    fr_path = os.path.join(LOCALES_DIR, "game-fr.json")

    print(f"Patching {de_path} …")
    patch_file(de_path, "gamePage", GAME_PAGE_DE)
    print("  ✓ game-de.json updated")

    print(f"Patching {fr_path} …")
    patch_file(fr_path, "gamePage", GAME_PAGE_FR)
    print("  ✓ game-fr.json updated")

    # Quick sanity check
    for path, lang in [(de_path, "DE"), (fr_path, "FR")]:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        gp = d.get("gamePage", {})
        racing_keys = set(gp.get("racing", {}).keys())
        overlord_keys = set(gp.get("overlord", {}).keys())
        print(f"\n[{lang}] gamePage top-level keys : {sorted(gp.keys())}")
        print(f"[{lang}] racing sub-keys          : {sorted(racing_keys)}")
        print(f"[{lang}] overlord sub-keys         : {sorted(overlord_keys)}")
        assert "extraSection" in overlord_keys, f"[{lang}] overlord.extraSection MISSING!"
        assert "faq" in racing_keys, f"[{lang}] racing.faq MISSING!"
    print("\nAll assertions passed. Done.")
