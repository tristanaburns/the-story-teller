# The Shadow Team Chronicles: Historical Events Guide

This guide explains how to create and work with historical event data in The Shadow Team Chronicles universe. Historical events serve as pivotal moments in the narrative timeline, establishing context for characters, locations, and storylines.

## Overview of Historical Event Schemas

The historical event schema system is modular and hierarchical, combining specialized event-specific schemas with common schemas for standardization:

```
historical_event_schema.json (Root schema)
├── temporal_data_schema.json
│   └── [references common/time_period_schema.json]
├── location_data_schema.json
│   └── [references common/references_schema.json]
├── participants_schema.json
│   └── [references common/references_schema.json]
├── causality_schema.json
│   └── [references common/impact_magnitude_schema.json]
└── cultural_significance_schema.json
```

Historical events use several common schemas:
- `common/references_schema.json` - For linking to characters, locations, and other events
- `common/event_type_schema.json` - For classifying the kind of event
- `common/impact_magnitude_schema.json` - For defining the scope and significance of consequences
- `common/time_period_schema.json` - For indicating when events occurred

## Step-by-Step Historical Event Creation

### 1. Start with the Base Historical Event Object

Begin by creating a JSON object with the required base properties:

```json
{
  "id": "e7c45bda-1b34-48c7-9a02-763da8645fd1",
  "name": "The Great Blackout of Neo-Tokyo",
  "description": "A catastrophic power failure that plunged the mega-city into darkness for 72 hours, leading to widespread system failures, civil unrest, and the birth of the city's underground hacker movement.",
  "object_type": "historical_event",
  "event_type": "technological_breakthrough"
}
```

### 2. Add Temporal Data

Define when the event occurred and its duration:

```json
"temporal_data": {
  "start_date": {
    "year": 2082,
    "month": 3,
    "day": 17,
    "hour": 14,
    "minute": 32,
    "precision": "exact",
    "calendar": "standard"
  },
  "end_date": {
    "year": 2082,
    "month": 3,
    "day": 20,
    "hour": 14,
    "precision": "exact",
    "calendar": "standard"
  },
  "duration": {
    "value": 72,
    "unit": "hours",
    "precision": "exact"
  },
  "historical_era": {
    "era_name": "Early Mega-Corporation Era",
    "significance_to_era": "Widely regarded as the first major failure of corporate infrastructure management, leading to increased regulation and public oversight of critical systems.",
    "era_transition": false
  }
}
```

### 3. Define Location Data

Specify where the event took place:

```json
"location_data": {
  "primary_location": {
    "id": "7f8e5d21-9e32-4a9b-8cb5-3f7ae9dbc105",
    "name": "Neo-Tokyo",
    "object_type": "location"
  },
  "secondary_locations": [
    {
      "id": "9d7c6b5a-4e3f-2d1e-0a9b-8c7d6e5f4a3b",
      "name": "Shibuya District",
      "object_type": "location"
    },
    {
      "id": "2a3b4c5d-6e7f-8g9h-0i1j-2k3l4m5n6o7p",
      "name": "Central Power Exchange",
      "object_type": "location"
    }
  ],
  "geographic_scope": "regional",
  "terrain_changes": [
    {
      "description": "Structural damage to the Central Power Exchange building due to subsequent fires and explosions.",
      "magnitude": "moderate",
      "permanence": "semi_permanent"
    }
  ]
}
```

### 4. Document Participants

Record who was involved in the event:

```json
"participants": {
  "key_individuals": [
    {
      "individual": {
        "id": "3f7d0bca-2e27-4edc-8010-41b5f3fb3982",
        "name": "Hanako Miyashiro",
        "object_type": "character"
      },
      "role": "newborn infant",
      "significance": "Born during the height of the blackout, giving her a mythical status among hackers as being 'born from darkness'.",
      "actions": ["None - was simply born during the event"],
      "fate": "Survived and grew up to become a legendary cyber-security specialist."
    },
    {
      "individual": {
        "id": "5a4b3c2d-1e0f-9g8h-7i6j-5k4l3m2n1o",
        "name": "Dr. Rei Chen",
        "object_type": "character"
      },
      "role": "Head Systems Engineer",
      "significance": "Tried to prevent the cascade failure through emergency protocols.",
      "actions": [
        "Attempted to isolate critical systems",
        "Organized manual restart procedures",
        "Documented system vulnerability that led to failure"
      ],
      "fate": "Lost position due to being made scapegoat but later vindicated when true cause was revealed."
    }
  ],
  "organizations": [
    {
      "organization": {
        "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "name": "NeoGrid Corporation",
        "object_type": "organization"
      },
      "involvement": "Primary power supplier responsible for maintaining the grid infrastructure",
      "stance": "defender",
      "outcome": "Faced massive lawsuits and restructuring, losing 40% market share following the incident."
    }
  ],
  "civilian_impact": {
    "population_affected": "Approximately 18.7 million residents of Neo-Tokyo",
    "casualty_count": "247 deaths, primarily from hospital system failures and accidents",
    "displacement": "Temporary evacuation of approximately 50,000 residents from high-rise buildings with inoperable safety systems",
    "economic_impact": "Estimated 3.8 billion credit loss from business disruption, property damage, and emergency services",
    "social_changes": [
      "Birth of the 'Darkness Generation' cultural identity",
      "Rise of community-based mutual aid networks",
      "Increased public distrust of corporate infrastructure management"
    ]
  }
}
```

### 5. Document Causality

Explain what caused the event and what resulted from it:

```json
"causality": {
  "root_causes": [
    {
      "cause": "Critical vulnerability in AI-managed power distribution system",
      "type": "technological",
      "timeframe": "Present for approximately 3 months before exploitation"
    },
    {
      "cause": "Corporate cost-cutting measures reducing redundant safety systems",
      "type": "economic",
      "timeframe": "Gradual reduction over preceding 5 years"
    }
  ],
  "triggering_incidents": [
    {
      "incident": "Coordinated cyber attack on power distribution nodes",
      "key_actors": [
        {
          "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
          "name": "The Void Collective",
          "object_type": "organization"
        }
      ],
      "intentionality": "deliberate"
    }
  ],
  "immediate_effects": [
    {
      "effect": "Complete power failure across 87% of Neo-Tokyo metropolitan area",
      "scope": "regional",
      "duration": "72 hours"
    },
    {
      "effect": "Failure of critical infrastructure systems including traffic control, hospital backup generators, and water purification",
      "scope": "regional",
      "duration": "24-72 hours depending on system"
    }
  ],
  "long_term_consequences": [
    {
      "consequence": "Formation of the Neo-Tokyo Grid Security Council",
      "domain": "political",
      "magnitude": "significant",
      "resultant_events": [
        {
          "id": "7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p",
          "name": "First Public Grid Security Act",
          "object_type": "historical_event"
        }
      ]
    },
    {
      "consequence": "Rise of independent hacker collectives offering alternative security solutions",
      "domain": "social",
      "magnitude": "moderate"
    },
    {
      "consequence": "Birth of the 'Ghost Network' - a secondary power and data infrastructure built by citizens",
      "domain": "technological",
      "magnitude": "major"
    }
  ]
}
```

### 6. Add Cultural Significance

```json
"cultural_significance": {
  "commemorations": [
    {
      "name": "Darkness Day",
      "type": "anniversary",
      "description": "Annual observation where Neo-Tokyo citizens voluntarily power down for one hour to commemorate the resilience shown during the blackout."
    }
  ],
  "artistic_depictions": [
    {
      "medium": "Film",
      "title": "72 Hours of Night",
      "creator": "Hideo Nakamura",
      "significance": "Award-winning documentary featuring survivor interviews and security footage from the event."
    },
    {
      "medium": "Music",
      "title": "When The Lights Died",
      "creator": "The Circuit Breakers",
      "significance": "Protest song that became an anthem for the anti-corporate movement that emerged following the blackout."
    }
  ],
  "historical_interpretations": [
    {
      "perspective": "Corporate",
      "narrative": "An unfortunate technical failure exploited by terrorist elements, demonstrating the need for greater security measures and corporate autonomy.",
      "proponents": "NeoGrid Corporation, Corporate Alliance media outlets"
    },
    {
      "perspective": "Revolutionary",
      "narrative": "A deliberate action exposing corporate negligence and the fragility of centralized infrastructure, representing a wake-up call to citizens.",
      "proponents": "The Ghost Network Collective, independent journalists"
    }
  ],
  "phrase_origin": [
    {
      "phrase": "Born in the dark",
      "meaning": "To have natural talent for working with technology without formal training; to have intuitive understanding of systems.",
      "context": "Refers to children born during the blackout who were mythologized to have special affinity with technology."
    }
  ]
}
```

## Key Schema Components

### Event Types

The `event_type` field uses the standardized event type enum from `common/event_type_schema.json`. Always select the most appropriate category from the available options. Some example types include:

- `battle` - A military engagement between opposing forces
- `technological_breakthrough` - A significant advancement that changes technological capabilities
- `natural_disaster` - A catastrophic event caused by natural processes
- `political_reform` - A significant change to political systems or governance

See the full list in the schema file for all available options.

### Impact Magnitude

The `impact_magnitude_schema.json` provides a standardized scale for defining the scope and significance of consequences:

- `trivial` - Effects limited to a few individuals
- `minor` - Local impact affecting a small community
- `moderate` - Regional influence affecting multiple communities
- `significant` - Large regional or small national impact
- `major` - National or multi-regional impact 
- `historic` - Continental or global impact
- `world_changing` - Global transformation altering civilization's trajectory
- `era_defining` - Marks transition between historical epochs
- `reality_altering` - Changes fundamental aspects of reality itself
- `cosmic` - Impact extends beyond a single world or dimension

Always select the appropriate magnitude to maintain consistency in how events are weighted across the narrative universe.

### Temporal Data

The temporal data schema allows for precise or approximate dating of events:

```json
"start_date": {
  "year": 2082,
  "month": 3,
  "day": 17,
  "hour": 14,
  "minute": 32,
  "precision": "exact",
  "calendar": "standard"
}
```

For events with uncertain dating or that span epochs:

```json
"start_date": {
  "year": -10000,
  "precision": "approximate",
  "description": "Estimated beginning of the Age of Myth",
  "calendar": "academic"
}
```

## Best Practices

1. **Connect to Other Entities**: Historical events should be well-linked to characters, locations, and other events to create a rich narrative tapestry.

2. **Balance Detail with Flexibility**: Provide enough specifics to make the event meaningful but leave room for creative interpretation in stories.

3. **Consider Multiple Perspectives**: Include differing interpretations of events to add depth and reflect how history is subjective.

4. **Use Standard Enums**: Always use the predefined event types and impact magnitudes for consistency.

5. **Establish Causality**: Clear chains of cause and effect help create coherent worldbuilding and logical story development.

6. **Document Cultural Impact**: How an event is remembered or commemorated can be as important as the event itself.

## Example: Minimal Viable Historical Event

```json
{
  "id": "e7c45bda-1b34-48c7-9a02-763da8645fd1",
  "name": "The Great Blackout of Neo-Tokyo",
  "description": "A catastrophic power failure that plunged the mega-city into darkness for 72 hours.",
  "object_type": "historical_event",
  "event_type": "technological_breakthrough",
  "temporal_data": {
    "start_date": {
      "year": 2082,
      "precision": "exact",
      "calendar": "standard"
    },
    "duration": {
      "value": 72,
      "unit": "hours"
    }
  },
  "location_data": {
    "primary_location": {
      "id": "7f8e5d21-9e32-4a9b-8cb5-3f7ae9dbc105",
      "name": "Neo-Tokyo",
      "object_type": "location"
    },
    "geographic_scope": "regional"
  },
  "causality": {
    "root_causes": [
      {
        "cause": "Critical vulnerability in AI-managed power distribution system",
        "type": "technological"
      }
    ],
    "immediate_effects": [
      {
        "effect": "Complete power failure across 87% of Neo-Tokyo metropolitan area",
        "scope": "regional"
      }
    ]
  }
}
```

## Validating Your Historical Event JSON

To validate your historical event JSON against the schema, use a JSON Schema validator like:

- [JSON Schema Validator](https://www.jsonschemavalidator.net/)
- VS Code with the "JSON Schema" extension
- The command line with tools like AJV

Paste both your historical event JSON and the schema to verify compliance before submitting to the database.
