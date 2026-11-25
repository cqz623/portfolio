/**
 * Shared homepage and project detail metadata.
 * Image files stay in their original folders. PDF source pages are one-based.
 * Descriptions summarize the supplied portfolio; null marks missing copy.
 * @typedef {{src: string, alt: string, width: number, height: number}} ProjectImage
 * @typedef {Object} Project
 * @property {{path: string, sourceUrl: string, autoHeight?: boolean} | undefined} [interactive]
 * @property {string | undefined} [researchGroup]
 * @property {{ratio: '3 / 2' | '5 / 4' | '1 / 1' | '4 / 5', fit: 'cover' | 'contain', position: string}} [thumbnail] Work-page composition only; detail images remain uncropped.
 * @property {boolean} [allowWithoutMedia] Explicitly registered projects may remain visible before media is supplied.
 * @property {string} slug
 * @property {string} title
 * @property {string | null} year
 * @property {string} category
 * @property {string} imageDirectory
 * @property {ProjectImage | null} cover
 * @property {ProjectImage[]} images
 * @property {string | null} description
 * @property {{document: string, pages: number[]} | null} source
 */

/** @type {Project[]} */
export const projects = [
  {
    "slug": "deep-eye",
    "title": "Deep Eye — Venice Boat Museum",
    "year": "2024",
    "category": "Adaptive Reuse / Historic Preservation",
    "imageDirectory": "/images/projects/deep-eye/",
    "cover": {
      "src": "/images/projects/deep-eye/cover.jpg",
      "alt": "Deep Eye — Venice Boat Museum — cover image",
      "width": 2002,
      "height": 1122
    },
    "source": {
      "document": "Design Portfolio_Qizhen Chen.pdf",
      "pages": [
        1,
        2,
        3,
        4
      ]
    },
    "description": "Deep Eye adapts two former shipbuilding warehouses in the Galeazze of Venice’s Arsenale into a museum of Venetian boat culture. The proposal retains the masonry fabric while inserting walls, exhibition routes and suspended vessels informed by the shapes and movement of boats. Existing walls and new displays become part of a continuous spatial sequence, making the relationship between maritime history, surviving construction and contemporary museum use central to the visitor experience.",
    "images": [
      {
        "src": "/images/projects/deep-eye/cover.jpg",
        "alt": "Deep Eye — Venice Boat Museum — cover image",
        "width": 2002,
        "height": 1122
      }
    ],
    "thumbnail": {
      "ratio": "3 / 2",
      "fit": "cover",
      "position": "50% 50%"
    }
  },
  {
    "slug": "floating-purifier",
    "title": "Floating Purifier — A Collaborative Ecosystem",
    "year": "2024",
    "category": "Ecological Design / Modular Construction",
    "imageDirectory": "/images/projects/floating-purifier/",
    "cover": {
      "src": "/images/projects/floating-purifier/cover.jpg",
      "alt": "Floating Purifier — A Collaborative Ecosystem — cover image",
      "width": 872,
      "height": 1234
    },
    "source": {
      "document": "Design Portfolio_Qizhen Chen.pdf",
      "pages": [
        5,
        6,
        7
      ]
    },
    "description": "Floating Purifier proposes interconnected floating units for New York’s East River, bringing tidal energy, water remediation, ecological restoration and public space into one modular system. Component studies combine reused tyres and bottles with frames and turbine elements, testing how small assemblies can aggregate into larger configurations. The proposal links material reuse and standardised construction to changing waterfront conditions, treating infrastructure as a shared platform for ecological functions and community participation.",
    "images": [
      {
        "src": "/images/projects/floating-purifier/cover.jpg",
        "alt": "Floating Purifier — A Collaborative Ecosystem — cover image",
        "width": 872,
        "height": 1234
      }
    ],
    "thumbnail": {
      "ratio": "4 / 5",
      "fit": "cover",
      "position": "50% 65%"
    }
  },
  {
    "slug": "cloud-pavilion",
    "title": "Cloud Pavilion",
    "year": "2024",
    "category": "Computational Design / Design-Build",
    "imageDirectory": "/images/projects/cloud/",
    "cover": {
      "src": "/images/projects/cloud/cover.jpg",
      "alt": "Cloud — The Outside Inflatable Pavilion Project — cover image",
      "width": 6443,
      "height": 5152
    },
    "source": {
      "document": "Design Portfolio_Qizhen Chen.pdf",
      "pages": [
        8
      ]
    },
    "description": "Cloud is a full-scale inflatable pavilion linking Avery Hall and Avery Plaza at Columbia University. A reflective membrane and suspended net are supported by 25 cables across a 20-metre span, turning a lightweight assembly into an occupiable public installation. Three-dimensional modelling, cable-length quantification and construction drawings coordinated anchorage, geometry and fabrication. The completed pavilion tests how inflation, tension and collective occupation can connect an interior room with the open space of the plaza.",
    "images": [
      {
        "src": "/images/projects/cloud/cover.jpg",
        "alt": "Cloud — The Outside Inflatable Pavilion Project — cover image",
        "width": 6443,
        "height": 5152
      }
    ],
    "thumbnail": {
      "ratio": "5 / 4",
      "fit": "cover",
      "position": "50% 60%"
    }
  },
  {
    "slug": "reviving-spaces",
    "title": "Self-Built Communities",
    "year": "2023",
    "category": "Housing / Urban Regeneration",
    "imageDirectory": "/images/projects/reviving-spaces/",
    "cover": {
      "src": "/images/projects/reviving-spaces/cover.jpg",
      "alt": "Reviving Spaces — Mental Well-being in Dense Residential Areas — cover image",
      "width": 2182,
      "height": 1248
    },
    "source": {
      "document": "Design Portfolio_Qizhen Chen.pdf",
      "pages": [
        9,
        10,
        11
      ]
    },
    "description": "Reviving Spaces examines the social and psychological consequences of replacing rural villages with dense high-rise housing in Nanjing’s Dingjiazhuang District. Resident-built additions are read as evidence of needs that standardised residential layouts do not fully accommodate. The proposal uses these informal spatial adaptations to reconsider the relationship between dwelling, everyday interaction and mental well-being, asking how housing regeneration can sustain residents’ social connections and sense of belonging.",
    "images": [
      {
        "src": "/images/projects/reviving-spaces/cover.jpg",
        "alt": "Reviving Spaces — Mental Well-being in Dense Residential Areas — cover image",
        "width": 2182,
        "height": 1248
      }
    ],
    "thumbnail": {
      "ratio": "3 / 2",
      "fit": "cover",
      "position": "50% 50%"
    }
  },
  {
    "slug": "light-and-shadow-lane",
    "title": "Reimagining Urban Alleys",
    "year": "2023",
    "category": "Urban Heritage / Residential Design",
    "imageDirectory": "/images/projects/light-and-shadow-lane/",
    "cover": {
      "src": "/images/projects/light-and-shadow-lane/cover.jpg",
      "alt": "Light and Shadow Lane — Residential Space Reshaping — cover image",
      "width": 1650,
      "height": 1260
    },
    "source": {
      "document": "Design Portfolio_Qizhen Chen.pdf",
      "pages": [
        12,
        13,
        14
      ]
    },
    "description": "Light and Shadow Lane explores how the spatial character of traditional Nanjing residences can inform new housing. The proposal reinterprets the textures and sequences of narrow streets and alleys through a vertical residential architecture, asking how movement, enclosure and neighbourhood memory can inform a different building form. Its central concern is the continuity of everyday experience as vernacular environments disappear, using spatial organisation to connect residential change with the cultural identity of existing neighbourhoods.",
    "images": [
      {
        "src": "/images/projects/light-and-shadow-lane/cover.jpg",
        "alt": "Light and Shadow Lane — Residential Space Reshaping — cover image",
        "width": 1650,
        "height": 1260
      }
    ],
    "thumbnail": {
      "ratio": "5 / 4",
      "fit": "cover",
      "position": "50% 55%"
    }
  },
  {
    "slug": "layered-walkway",
    "title": "Underbridge Commons",
    "year": "2023",
    "category": "Urban Design / Public Space",
    "imageDirectory": "/images/projects/layered-walkway/",
    "cover": {
      "src": "/images/projects/layered-walkway/cover.png",
      "alt": "Layered Walkway — Under-bridge Fragmented Space Revitalization — cover image",
      "width": 4266,
      "height": 3016
    },
    "source": {
      "document": "Design Portfolio_Qizhen Chen.pdf",
      "pages": [
        15,
        16,
        17
      ]
    },
    "description": "Layered Walkway reconsiders fragmented spaces beneath bridges in Nanjing as a connected public resource. The proposal introduces green belts, places to rest and recreational areas that can accommodate different ages and everyday activities. Linking these interventions to existing urban resources and local social needs, the project explores how under-bridge renewal can strengthen shared use and social connections within the surrounding city.",
    "images": [
      {
        "src": "/images/projects/layered-walkway/cover.png",
        "alt": "Layered Walkway — Under-bridge Fragmented Space Revitalization — cover image",
        "width": 4266,
        "height": 3016
      }
    ],
    "thumbnail": {
      "ratio": "3 / 2",
      "fit": "cover",
      "position": "50% 50%"
    }
  },
  {
    "slug": "downsville-covered-bridge",
    "title": "Downsville Covered Bridge",
    "year": "2026",
    "category": "Digital documentation / Preservation",
    "imageDirectory": "/images/projects/downsville-covered-bridge/",
    "cover": {
      "src": "/images/projects/downsville-covered-bridge/cover.jpg",
      "alt": "Downsville Covered Bridge — cover image",
      "width": 2116,
      "height": 1136
    },
    "source": null,
    "description": "The Downsville Covered Bridge study combines digital documentation and structural assessment of an 1854 timber bridge over the East Branch of the Delaware River. Field survey, terrestrial laser scanning and photogrammetry establish its as-built geometry, which is reconstructed in Rhino and analysed in SAP2000. Studying the combined Long and Queenpost truss systems alongside observed deterioration links geometric records to load capacity, critical members and priorities for future preservation and monitoring.",
    "images": [
      {
        "src": "/images/projects/downsville-covered-bridge/cover.jpg",
        "alt": "Downsville Covered Bridge — cover image",
        "width": 2116,
        "height": 1136
      }
    ],
    "thumbnail": {
      "ratio": "3 / 2",
      "fit": "cover",
      "position": "50% 50%"
    }
  },
  {
    "slug": "yuanmingyuan",
    "title": "Yuanmingyuan",
    "year": "2026",
    "category": "Architectural heritage / Computation",
    "imageDirectory": "/images/projects/yuanmingyuan/",
    "cover": null,
    "source": null,
    "description": null,
    "images": [],
    "thumbnail": {
      "ratio": "5 / 4",
      "fit": "cover",
      "position": "50% 50%"
    }
  },
  {
    "slug": "venice-arsenale",
    "title": "Venice Arsenale",
    "year": "2025",
    "category": "Material studies / Conservation",
    "imageDirectory": "/images/projects/venice-arsenale/",
    "cover": null,
    "source": null,
    "description": null,
    "images": [],
    "thumbnail": {
      "ratio": "5 / 4",
      "fit": "cover",
      "position": "50% 50%"
    }
  },
  {
    "slug": "mercury-store",
    "title": "Mercury Store",
    "year": null,
    "category": "Architecture",
    "imageDirectory": "/images/projects/mercury-store/",
    "cover": null,
    "source": null,
    "description": "Mercury Store studies the changing material structure of a historic industrial building in Brooklyn. Field measurement, material research and a Rhino reconstruction trace the transition from brick masonry and steel trusses through heavy timber replacement to later CLT and glulam interventions. A physical model combines 3D-printed masonry and connection components with laser-cut timber elements, making successive construction phases legible and examining how new structural systems can be integrated with retained historic fabric.",
    "images": [],
    "thumbnail": {
      "ratio": "5 / 4",
      "fit": "cover",
      "position": "50% 50%"
    }
  },
  {
    "slug": "spatial-barrier-game",
    "title": "Spatial Barrier Game",
    "year": null,
    "category": "Spatial Computing / Interactive Simulation",
    "researchGroup": "Spatial Computing",
    "imageDirectory": "/images/projects/spatial-barrier-game/",
    "cover": {
      "src": "/images/projects/spatial-barrier-game/cover.jpg",
      "alt": "Spatial Barrier Game — interactive simulation cover",
      "width": 1110,
      "height": 1242
    },
    "source": null,
    "images": [],
    "description": "Spatial Barrier Game explores how the representation of location differs from the accessibility of a place. On an interactive grid, coordinates, reference frames and location queries describe where positions are, while placed barriers change the routes between them. Manhattan distance provides an unobstructed baseline; breadth-first search finds the shortest walkable paths. Detour measurements and before-and-after distance fields reveal how barriers reshape accessibility even when the locations themselves remain fixed.",
    "interactive": {
      "path": "/interactive/spatial-barrier-game/index.html",
      "sourceUrl": "https://github.com/cqz623/spatial-barrier-game"
    },
    "thumbnail": {
      "ratio": "1 / 1",
      "fit": "cover",
      "position": "50% 15%"
    }
  },
  {
    "slug": "population-flood-sandbox",
    "title": "Population × Flood Sandbox",
    "year": null,
    "category": "Research / Spatial Computing",
    "researchGroup": "Spatial Computing",
    "imageDirectory": "/images/projects/population-flood-sandbox/",
    "cover": {
      "src": "/images/projects/population-flood-sandbox/cover.jpg",
      "alt": "Population × Flood Sandbox — Manhattan and Brooklyn exposure map",
      "width": 856,
      "height": 1180
    },
    "images": [],
    "source": null,
    "description": "Population × Flood Sandbox compares estimated population exposure to modelled flood extents in Manhattan and Brooklyn across four precomputed scenarios: 2020, 2030, 2040, and 2050. An interactive map combines flood boundaries with population allocated to intersecting residential parcels and summarised in 250-metre grid cells. The dashboard reveals the spatial distribution of exposure across scenarios. These simplified comparisons are not validated causal predictions or hydrodynamic forecasts; the historical point-based counterfactual uses a different exposure rule and is not directly comparable.",
    "interactive": {
      "path": "/interactive/population-flood-sandbox/index.html",
      "sourceUrl": "https://github.com/cqz623/population-flood-sandbox",
      "autoHeight": true
    },
    "thumbnail": {
      "ratio": "4 / 5",
      "fit": "cover",
      "position": "50% 0%"
    }
  },
  {
    "slug": "material-experimentation",
    "title": "Material Experimentation",
    "year": null,
    "category": "Experimental Design",
    "imageDirectory": "/images/projects/material- experimentation/",
    "cover": null,
    "images": [],
    "source": null,
    "description": "Material Experimentation investigates how everyday objects become spatial assemblies through repeated making and photographic documentation. Working across the themes of Purity, Fertility, Multiplicity and Luminosity, the studies inflate plastic bags, compress personal objects, layer shopping bags and form connected wire structures. Tying, suspension, compression and flexible connections are tested as ways of organising individual components into larger configurations. The resulting prototypes explore relationships among material behaviour, assembly sequence and the spaces produced by simple operations.",
    "thumbnail": {
      "ratio": "5 / 4",
      "fit": "cover",
      "position": "50% 50%"
    }
  },
  {
    "slug": "aptne-presentation",
    "title": "APTNE Presentation",
    "year": null,
    "category": "",
    "imageDirectory": "/images/projects/APTNE/",
    "cover": null,
    "images": [],
    "source": null,
    "description": null,
    "allowWithoutMedia": true
  }
];

/** Metadata supplied for automatically discovered folders; unspecified fields stay empty.
 * @type {Record<string, {title?: string, description?: string}>}
 */
export const discoveredProjectDetails = {
  "theory-in-practice": {
    "title": "Theory in Practice",
    "description": "Theory in Practice connects material documentation with the cultural practices of remembrance. Plans, sections and full-scale window details record a memorial structure in marble, granite and bronze, alongside observations of marble deformation, water infiltration, staining and bronze corrosion. A parallel study traces floral offerings and memorial vessels across changing funerary traditions. The work relates close inspection of architectural fabric to the objects and rituals that give a commemorative place its meaning."
  },
  "xu-tiantian": {
    "title": "Architecture as Ecology"
  },
  "funeral-home": {
    "title": "Funerary Heritage",
    "description": "Funeral Home examines the preservation significance of the former H. Nieberg Funeral Home at 139–141 Ludlow Street on Manhattan’s Lower East Side. Historical maps, tax photographs, building records and architectural observation connect its Gothic terra-cotta façade to the practical and communal functions of a Jewish immigrant funeral business. The study argues for preserving the building’s distinctive frontage and material character as evidence of the relationship between urban architecture, burial practices and neighbourhood networks of care."
  },
  "decarbonization": {
    "title": "Building Reuse & Carbon",
    "description": "Decarbonization examines preservation, redevelopment and embodied carbon within Columbia University’s Manhattanville campus expansion. Archival research, historical building inventories and ArcGIS mapping trace patterns of construction and demolition, while field surveys and building-scale digital reconstructions document existing conditions. By connecting spatial evidence with embodied-carbon and life-cycle assessment, the research supports evaluation of preservation, adaptive reuse and deconstruction as decisions about both the existing urban fabric and the material consequences of future development."
  },
  "sustainability": {
    "title": "Forest Postal Station",
    "description": "Sustainability explores the relationship between building form, landscape and energy systems in a riverside proposal. A series of connected, pitched-roof volumes accommodates interior spaces and circulation, while the site view integrates planting and roof-mounted solar panels. The sectional study makes the structural frame and changing floor levels legible. Together, these drawings examine the coordination of roof form, internal organisation and outdoor space within a green setting."
  },
  "theatre": {
    "title": "Theater for All",
    "description": "The theatre proposal combines performance, rehearsal and public activity within a layered urban building. Plans bring together a theatre hall, black-box theatre, chamber hall and rehearsal rooms, while an outdoor theatre and landscaped circulation extend activity beyond enclosed auditoria. An exploded axonometric clarifies how these programmes overlap across levels, using terraces and connected public spaces to mediate between the building and the surrounding neighbourhood."
  }
};
