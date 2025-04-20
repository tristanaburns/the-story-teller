# The Shadow Team Chronicles: Location Schemas Guide

This guide explains how to create rich, detailed location objects using The Shadow Team Chronicles schema system. Following these instructions will ensure locations are consistently defined and properly integrated into the narrative database.

## Overview of Location Schemas

The location schema system is modular and hierarchical, combining specialized location-specific schemas with common schemas for standardization:

```
location_schema.json (Root schema)
├── geographic_data_schema.json
│   └── [references common/biome_type_schema.json]
├── accessibility_schema.json
├── inhabitants_schema.json
│   └── [references common/references_schema.json]
├── history_schema.json
│   └── [references common/historical_significance_schema.json]
├── culture_schema.json
├── features_schema.json
├── time_variants_schema.json
│   └── [references common/time_period_schema.json]
├── environment_schema.json
├── governance_schema.json
└── visual_representation_schema.json
    └── [inherits from common/visual_representation_schema.json]
```

Location objects use several common schemas:
- `common/references_schema.json` - For linking to characters, other locations, and events
- `common/location_type_schema.json` - For classifying the kind of location
- `common/biome_type_schema.json` - For defining the natural environment
- `common/visual_representation_schema.json` - For consistent visual guidelines
- `common/impact_magnitude_schema.json` - For defining the scale of accessibility challenges

## Step-by-Step Location Creation

### 1. Start with the Base Location Object

Begin by creating a JSON object with the required base properties:

```json
{
  "id": "7f8e5d21-9e32-4a9b-8cb5-3f7ae9dbc105",
  "name": "Neo-Tokyo",
  "description": "A sprawling cyberpunk metropolis built upon the ruins of old Tokyo after the Great Cataclysm. Known for its towering arcologies, neon-bathed streets, and stark contrast between corporate luxury and street-level grit.",
  "object_type": "location",
  "location_type": "city"
}
```

### 2. Add Geographic Data

Define the physical characteristics and position of the location:

```json
"geographic_data": {
  "coordinates": {
    "latitude": 35.6762,
    "longitude": 139.6503,
    "elevation": "Variable, from sea level to 3,200 meters at the peak of the Central Arcology"
  },
  "area": {
    "value": 2188,
    "unit": "square kilometers"
  },
  "terrain": {
    "dominant_features": [
      "Urban landscape with massive arcologies",
      "Artificial islands extending into Tokyo Bay",
      "Underground network of tunnels and abandoned infrastructure",
      "Remnants of old Tokyo integrated into new structures"
    ],
    "biome": "urban",
    "notable_topography": "Built on multiple levels, with up to 12 distinct vertical zones in some areas. The Bay District features artificial floating platforms housing luxury residences and corporate facilities."
  },
  "climate": {
    "classification": "Artificially regulated",
    "seasons": "Traditional seasons are experienced differently across city levels, with upper levels featuring controlled climate systems while lower levels experience more extreme weather conditions.",
    "notable_weather": "Frequent acid rain in lower levels; occasional electromagnetic storms from experimental energy plants; perpetual fog in certain districts from industrial emissions and climate control systems."
  },
  "borders": {
    "natural_boundaries": [
      {
        "feature": "Tokyo Bay",
        "direction": "east"
      },
      {
        "feature": "Modified Mount Takao Range",
        "direction": "west"
      }
    ],
    "political_boundaries": [
      {
        "entity": "Yokohama Special Economic Zone",
        "direction": "south"
      },
      {
        "entity": "Saitama Autonomous District",
        "direction": "north"
      }
    ]
  }
}
```

### 3. Define Accessibility

```json
"accessibility": {
  "access_methods": [
    {
      "method_type": "physical_path",
      "description": "Maglev train network connecting to other major Asian cities and the Global Transit System.",
      "requirements": ["Valid citizen ID or visitor visa", "Transit fare"],
      "reliability": "permanent",
      "known_by": "public"
    },
    {
      "method_type": "physical_path",
      "description": "Heavily monitored airspace accessible via designated flight corridors.",
      "requirements": ["Aviation clearance", "Corporate or government flight permit"],
      "reliability": "permanent",
      "known_by": "restricted"
    },
    {
      "method_type": "secret_passage",
      "description": "Network of unmapped tunnels and maintenance shafts connecting to neighboring regions, primarily used by smugglers and those avoiding surveillance.",
      "requirements": ["Knowledge of entry points", "Often requires bribing local guides"],
      "reliability": "intermittent",
      "known_by": "secret"
    }
  ],
  "physical_barriers": [
    {
      "barrier_type": "Security Wall",
      "difficulty": "major",
      "bypass_methods": [
        "Official entry through monitored checkpoints",
        "Smuggler tunnels (requires insider knowledge)",
        "High-altitude drops (requires specialized equipment and corporate clearance)"
      ]
    }
  ],
  "permissions_required": [
    {
      "authority": "Neo-Tokyo Metropolitan Security Bureau",
      "condition": "Official identity verification and purpose declaration for all visitors.",
      "enforcement": "Automated security systems, drone patrols, and physical security forces. Unauthorized entry attempts typically result in detention and deportation or imprisonment depending on security threat assessment."
    }
  ],
  "navigation_challenges": [
    {
      "challenge_type": "Multi-level complexity",
      "description": "The city's vertical structure creates a complex three-dimensional navigation environment where streets exist on multiple levels with labyrinthine connections.",
      "mitigation": "Augmented reality navigation systems are widely available, though less expensive versions contain deliberate gaps in restricted areas."
    }
  ]
}
```

### 4. Document Inhabitants

```json
"inhabitants": {
  "population": {
    "total": 36500000,
    "density": "16,682 per square kilometer",
    "demographics": [
      {
        "group": "Japanese descent",
        "percentage": 68
      },
      {
        "group": "Other Asian descent",
        "percentage": 18
      },
      {
        "group": "Western descent",
        "percentage": 9
      },
      {
        "group": "Other/Mixed",
        "percentage": 5
      }
    ],
    "non_human_population": "Approximately 2.1 million registered artificial intelligences with citizenship status; unknown number of illegal or unregistered AIs."
  },
  "major_groups": [
    {
      "entity_reference": {
        "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "name": "Arasaka Corporation",
        "object_type": "organization"
      },
      "presence": "Headquarters located in Central Arcology; controls approximately 35% of the city's infrastructure and security forces.",
      "influence": "major",
      "areas_controlled": ["Neo-Tokyo Financial District", "Arasaka Waterfront", "Security Zones 2, 5, and 7"]
    },
    {
      "entity_reference": {
        "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        "name": "Ghost Network Collective",
        "object_type": "organization"
      },
      "presence": "Decentralized hacker organization operating from Shinjuku Underground.",
      "influence": "moderate",
      "areas_controlled": ["Digital infrastructure in Lower Shinjuku", "Various hidden server farms throughout abandoned subway tunnels"]
    }
  ],
  "notable_inhabitants": [
    {
      "entity_reference": {
        "id": "3f7d0bca-2e27-4edc-8010-41b5f3fb3982",
        "name": "Hanako Miyashiro",
        "object_type": "character"
      },
      "significance": "Born during the Great Blackout, Hanako represents the 'dark generation' and has become a symbol of Neo-Tokyo's resilient underground culture."
    }
  ],
  "cultural_dynamics": {
    "dominant_cultures": [
      "Neo-Japanese corporate culture",
      "Street-level tech-fusion subcultures",
      "Digital consciousness community"
    ],
    "social_tensions": [
      {
        "conflict": "Class division between corporate citizens and street-level residents",
        "manifestation": "Restricted access to upper levels, different legal systems applied based on social credit status"
      },
      {
        "conflict": "Human vs. AI rights movements",
        "manifestation": "Ongoing protests and counterprotests around the AI Citizenship Expansion Act"
      }
    ],
    "cultural_events": [
      {
        "name": "Cherry Blossom Memorial",
        "description": "Annual festival commemorating the Great Cataclysm that destroyed old Tokyo, featuring holographic cherry blossoms throughout the city at all levels."
      }
    ]
  }
}
```

### 5. Add Historical Context

```json
"history": {
  "founding": {
    "date": {
      "year": 2042,
      "precision": "exact",
      "calendar": "standard"
    },
    "circumstances": "Founded on the ruins of Tokyo following the Great Cataclysm of 2039, initially as a reconstruction project funded by a consortium of Pan-Asian corporations."
  },
  "major_events": [
    {
      "event_reference": {
        "id": "e7c45bda-1b34-48c7-9a02-763da8645fd1",
        "name": "The Great Blackout of Neo-Tokyo",
        "object_type": "historical_event"
      },
      "impact": "Led to the development of autonomous power systems for each city level and the rise of the Ghost Network as an alternative infrastructure."
    }
  ],
  "historical_significance": {
    "cultural_importance": "Neo-Tokyo represents the first and most prominent example of post-Cataclysm urban renewal, setting the pattern for other mega-cities around the world.",
    "symbolic_meaning": "Serves as both a symbol of human resilience and corporate overreach, frequently referenced in global political discourse as either utopian achievement or dystopian warning."
  },
  "development_phases": [
    {
      "period_name": "Emergency Reconstruction",
      "start_year": 2039,
      "end_year": 2045,
      "description": "Rapid building of survival infrastructure over ruins, with little urban planning."
    },
    {
      "period_name": "Corporate Consolidation",
      "start_year": 2045,
      "end_year": 2060,
      "description": "Major corporations established control zones and began building signature arcologies."
    },
    {
      "period_name": "Vertical Expansion Era",
      "start_year": 2060,
      "end_year": 2075,
      "description": "Explosive growth upward as space limitations drove development of the multi-level urban structure that defines modern Neo-Tokyo."
    }
  ]
}
```

### 6. Add Notable Features

```json
"features": {
  "landmarks": [
    {
      "name": "Central Arcology",
      "location": {
        "coordinates": {
          "latitude": 35.6895,
          "longitude": 139.6917
        },
        "district": "Shinjuku"
      },
      "description": "A massive 300-story megastructure housing over two million residents plus corporate offices, with its own ecosystem, weather, and governance.",
      "significance": "Serves as Neo-Tokyo's most recognizable structure and the physical manifestation of corporate power in the city.",
      "accessibility": "Lower 50 floors open to public with proper identification; higher levels require specific clearance or residence status."
    }
  ],
  "infrastructure": {
    "transportation": [
      {
        "system_name": "Multi-Level Transit Network",
        "description": "Integrated system of maglev trains, vacuum tubes, and aerial trams connecting all city levels and districts.",
        "coverage": "98% of populated areas within 500 meters of an access point.",
        "restrictions": "Access to certain lines determined by citizen status and security clearance."
      }
    ],
    "power": [
      {
        "system_name": "Fusion Grid",
        "description": "Network of small fusion reactors positioned throughout the city, with redundant distribution systems following the Great Blackout.",
        "capacity": "Generates 173% of daily peak consumption, with surplus stored in massive capacitor arrays."
      }
    ]
  },
  "districts": [
    {
      "name": "Upper Shibuya",
      "level": "Upper city (levels 30-75)",
      "character": "Gleaming corporate plaza district with holographic advertisements, high-end shopping, and security presence.",
      "notable_for": "Largest concentration of augmented reality overlays in the city, creating a dual-reality experience visible only to those with neural interfaces."
    },
    {
      "name": "Lower Shinjuku",
      "level": "Below ground (levels -1 to -8)",
      "character": "Densely packed market district built in former subway tunnels, known for independent tech shops and information brokers.",
      "notable_for": "Home to the infamous 'Circuit Row' where any technology can be acquired for the right price, regardless of legality."
    }
  ]
}
```

### 7. Add Governance Data

```json
"governance": {
  "political_system": {
    "type": "Corporate-Administrative Republic",
    "description": "Hybrid governance system where a publicly elected council oversees basic city services while corporate entities maintain sovereignty over their respective territories within the city."
  },
  "leadership": [
    {
      "title": "Metropolitan Administrator",
      "name": "Takahiro Yamane",
      "authority": "Elected official responsible for coordinating basic services across all districts and representing Neo-Tokyo in international affairs."
    },
    {
      "title": "Corporate Council Chair",
      "name": "Miyu Nakamura",
      "authority": "Rotating position held by executive from one of the city's five major corporations, currently representing Arasaka Corporation."
    }
  ],
  "law_enforcement": [
    {
      "agency": "Neo-Tokyo Metropolitan Security",
      "jurisdiction": "Public spaces and government districts",
      "description": "Publicly funded police force handling standard criminal matters in common areas."
    },
    {
      "agency": "Corporate Security Forces",
      "jurisdiction": "Corporate districts and properties",
      "description": "Private security forces with full police powers within their corporate territories, often better equipped than public security."
    }
  ],
  "legal_system": {
    "description": "Multi-tiered justice system where jurisdiction is determined by location of crime and citizenship status of involved parties. Corporate citizens are typically tried under corporate law while public citizens fall under metropolitan code."
  }
}
```

### 8. Add Visual Representation

```json
"visual_representation": {
  "essential_visual_elements": [
    {
      "element": "Tiered vertical cityscape",
      "importance": "defining",
      "description": "The city's distinctive silhouette featuring multiple levels rising in a roughly pyramidal arrangement, with the Central Arcology dominating the skyline."
    },
    {
      "element": "Omnipresent holographic advertising",
      "importance": "major",
      "description": "Massive animated advertisements projected from buildings, floating platforms, and drones, bathing the city in constantly shifting colored light."
    },
    {
      "element": "Level stratification",
      "importance": "defining",
      "description": "Clear visual distinction between the gleaming upper levels with abundant light and greenery, middle levels with moderate density and mixed aesthetics, and lower levels characterized by shadows, neon, and industrial infrastructure."
    }
  ],
  "style_guidelines": {
    "color_palette": {
      "primary_colors": ["#0A1921", "#2B5278"],
      "accent_colors": ["#00B2FF", "#FF4D00", "#F2E205"],
      "color_symbolism": "Blue tones represent corporate power and technology, orange represents street culture and rebellion, while yellow signifies wealth and commerce."
    },
    "artistic_style": "High-contrast cyberpunk aesthetic combining ultramodern architecture with lived-in grit. Upper levels should appear sleek and minimalist, while lower levels should feature retrofitted technology and improvised solutions."
  },
  "image_generation_prompts": {
    "standard_prompt": "Massive futuristic cyberpunk city with tiered architecture, towering arcologies, flying vehicles between buildings, omnipresent holographic advertisements in blue and red, neon-lit lower levels beneath gleaming corporate spires, crowded streets with diverse population, visible class division between upper and lower city levels, atmospheric haze, night scene with rain-slicked streets reflecting neon lights."
  }
}
```

### 9. Add Environment Data

```json
"environment": {
  "natural_elements": {
    "integration": "Heavily engineered and controlled natural elements throughout the city, with most plant life existing in contained systems.",
    "notable_features": [
      {
        "name": "Sky Gardens",
        "description": "Massive terraced gardens on upper levels of arcologies, containing carefully curated ecosystems with both ornamental and food-producing plants."
      },
      {
        "name": "Bay Purification Zone",
        "description": "Engineered wetlands and floating algae farms that help filter toxins from the bay water while producing biofuel."
      }
    ]
  },
  "environmental_conditions": {
    "air_quality": {
      "upper_levels": "Excellent, maintained by advanced filtration systems",
      "mid_levels": "Moderate, with occasional contamination during adverse weather",
      "lower_levels": "Poor to hazardous, requiring filtration masks in many areas"
    },
    "water_sources": {
      "primary": "Desalination plants processing sea water",
      "secondary": "Atmospheric moisture collection systems on major buildings",
      "quality_control": "Multi-stage purification required for all water entering residential districts"
    }
  },
  "ecological_impact": {
    "footprint": "Massive resource consumption offset by cutting-edge efficiency and recycling technologies.",
    "sustainability_measures": [
      "Mandatory energy-positive construction for all new buildings",
      "Comprehensive waste reclamation system processing 94% of city refuse",
      "Artificial photosynthesis panels supplementing oxygen production"
    ],
    "environmental_hazards": [
      {
        "name": "Dead Zone Alpha",
        "description": "Area of extreme radiation and chemical contamination from the Great Cataclysm, sealed beneath reinforced containment structures."
      }
    ]
  }
}
```

### 10. Add Time Variants (if applicable)

```json
"time_variants": [
  {
    "time_period": {
      "year": 2040,
      "precision": "exact",
      "calendar": "standard"
    },
    "name": "Emergency Tokyo",
    "physical_description": "A hastily constructed patchwork of temporary shelters, emergency infrastructure, and repurposed damaged buildings from old Tokyo. Dominated by prefabricated units and construction equipment.",
    "significant_differences": [
      "No vertical development beyond surviving skyscrapers",
      "Heavy military and emergency services presence",
      "Limited functioning infrastructure with frequent outages",
      "Population approximately 3.2 million (compared to current 36.5 million)"
    ]
  }
]
```

## Key Schema Components

### Location Types

The `location_type` field uses the standardized location type enum from `common/location_type_schema.json`. Always select the most appropriate category from the available options:

- `city` - A large urban settlement with established governance
- `building` - A discrete structure constructed for specific purposes
- `natural_feature` - A distinct geographical or environmental element
- `district` - A defined area within a larger settlement or region
- `realm` - A distinct plane of existence or dimensional space

See the full list in the schema file for all available options.

### Biome Types

The `biome` field within the geographic data uses standardized biome types from `common/biome_type_schema.json`:

- `urban` - Human-dominated environment with buildings and infrastructure
- `temperate_forest` - Forest with distinct seasons and primarily deciduous trees
- `desert` - Barren area with little precipitation
- `tundra` - Cold treeless plain with permanently frozen subsoil
- `magical_nexus` - Area with concentrated magical energy altering natural laws

These standardized biome types help maintain consistency across the world-building elements.

### Accessibility Methods

When documenting how locations can be accessed, use the standardized accessibility method types:

- `physical_path` - Standard routes like roads, paths, or passages
- `portal` - Magical or technological gateways that connect distant locations
- `magical_ritual` - Access requiring specific magical procedures
- `secret_passage` - Hidden or concealed entries known to few
- `dimensional_shift` - Methods involving movement between planes of reality

### Impact Magnitude

When describing the difficulty of barriers or the significance of location features, use the standard impact magnitude scale:

- `trivial` - Very easily overcome with minimal effort
- `minor` - Presents a small obstacle or challenge
- `moderate` - Requires specific skills or resources to overcome
- `significant` - Substantial barrier requiring specialized knowledge
- `major` - Extremely difficult to overcome without specific preparations
- Through to `cosmic` for truly reality-altering barriers

## Best Practices

1. **Start with Core Properties**: Begin with the base location properties and geographic data before adding more specialized components.

2. **Use Hierarchy for Complex Locations**: For locations with multiple distinct areas, use nested location references rather than trying to describe everything in one location object.

3. **Balance Detail with Flexibility**: Provide enough specifics to make the location distinctive, but leave room for creative interpretation in stories.

4. **Connect to Other Entities**: Link locations to characters, events, and other locations using reference objects to create a rich narrative tapestry.

5. **Document Changes Over Time**: For locations that change significantly through the narrative timeline, use time variants to capture different states of existence.

6. **Apply Consistent Style**: Use the visual representation schema to ensure descriptions maintain a consistent aesthetic across different media.

## Example: Minimal Viable Location

```json
{
  "id": "7f8e5d21-9e32-4a9b-8cb5-3f7ae9dbc105",
  "name": "Neo-Tokyo",
  "description": "A sprawling cyberpunk metropolis built upon the ruins of old Tokyo.",
  "object_type": "location",
  "location_type": "city",
  "geographic_data": {
    "coordinates": {
      "latitude": 35.6762,
      "longitude": 139.6503
    },
    "terrain": {
      "biome": "urban"
    }
  },
  "accessibility": {
    "access_methods": [
      {
        "method_type": "physical_path",
        "description": "Maglev train network connecting to other major Asian cities.",
        "known_by": "public"
      }
    ]
  },
  "features": {
    "landmarks": [
      {
        "name": "Central Arcology",
        "description": "A massive 300-story megastructure housing over two million residents."
      }
    ]
  }
}
```

## Validating Your Location JSON

To validate your location JSON against the schema, use a JSON Schema validator like:

- [JSON Schema Validator](https://www.jsonschemavalidator.net/)
- VS Code with the "JSON Schema" extension
- The command line with tools like AJV

Paste both your location JSON and the schema to verify compliance before submitting to the database.
