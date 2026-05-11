# AI Features Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   PRIME Teaching Platform                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Dashboard (/ dashboard)                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │  Classes     │  │  Lessons     │  │  Assessments │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │  Progress    │  │  Calendar    │  │  Resources   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │            ✨ AI TOOLS (NEW)                    │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │   │   │
│  │  │  │ Curriculum  │ │ Lesson Plan │ │   Teaching │ │   │   │
│  │  │  │  Breakdown  │ │  Generator  │ │    Notes   │ │   │   │
│  │  │  └─────────────┘ └─────────────┘ └────────────┘ │   │   │
│  │  │  ┌────────────────────────────────────────────┐ │   │   │
│  │  │  │   Teacher Professional Development        │ │   │   │
│  │  │  └────────────────────────────────────────────┘ │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Sidebar Navigation                        │   │
│  │  Dashboard → Classes → Lessons → Assessments → ... AI   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
```

## Frontend to Backend Data Flow

### Curriculum Breakdown Flow
```
┌─────────────────────────────────────────┐
│  User Input (Frontend)                  │
│  - Subject, Grade, Learning Days        │
│  - Textbook/Curriculum Content          │
└────────────────┬────────────────────────┘
                 │
                 ↓
     ┌───────────────────────┐
     │  /dashboard/ai-tools/ │
     │  curriculum/page.tsx  │
     └───────────┬───────────┘
                 │
         fetch('/api/ai/curriculum-breakdown')
                 │
                 ↓
     ┌───────────────────────────────────┐
     │  /api/ai/curriculum-breakdown     │
     │  POST Route Handler               │
     └──────────────┬────────────────────┘
                    │
            parseJSON input
                    │
                    ↓
     ┌──────────────────────────────────┐
     │  AI Generation (GPT-5-mini)      │
     │  - Analyze content               │
     │  - Create session structure      │
     │  - Generate objectives           │
     │  - Suggest resources             │
     └──────────────┬────────────────────┘
                    │
            parseJSON output
                    │
                    ↓
     ┌──────────────────────────────────┐
     │  Return Sessions Array           │
     │  {                               │
     │    sessions: [...]               │
     │  }                               │
     └──────────────┬────────────────────┘
                    │
                    ↓
     ┌──────────────────────────────────┐
     │  Frontend Display                │
     │  - Show sessions in cards        │
     │  - Display objectives            │
     │  - List resources                │
     │  - Enable download               │
     └──────────────────────────────────┘
```

## API Architecture

```
┌─────────────────────────────────────────────────────┐
│           Vercel AI Gateway (Default)               │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  OpenAI Models (No provider imports needed)  │  │
│  │  - openai/gpt-5-mini (Fast & Cost-effective) │  │
│  │  - Other providers available (Anthropic, etc)│  │
│  └────────┬─────────────────────────────────────┘  │
└───────────┼──────────────────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────┐
│             AI SDK 6 (Route Handlers)               │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  generateText()                            │   │
│  │  - Model: 'openai/gpt-5-mini'             │   │
│  │  - Temperature: 0.7                       │   │
│  │  - Max tokens: 4000-5500                  │   │
│  │  - Returns: { text: "..." }               │   │
│  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────┐
│          Four API Routes (POST only)                │
│                                                     │
│  /api/ai/curriculum-breakdown     (50 lines)       │
│  /api/ai/lesson-plan              (63 lines)       │
│  /api/ai/teaching-notes           (91 lines)       │
│  /api/ai/teacher-development      (110 lines)      │
│                                                     │
│  Common Pattern:                                   │
│  1. Parse JSON input                              │
│  2. Validate required fields                      │
│  3. Build detailed prompt                         │
│  4. Call generateText()                           │
│  5. Parse/format output                           │
│  6. Return JSON response                          │
└─────────────────────────────────────────────────────┘
```

## Frontend Component Architecture

```
┌──────────────────────────────────────────────────────────┐
│  App Layout                                              │
│  └─ Sidebar (Updated with AI Tools)                     │
│  └─ Dashboard                                            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  /dashboard/ai-tools (Hub Page)                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │  │
│  │  │ Card 1   │ │ Card 2   │ │ Card 3   │         │  │
│  │  │Curriculum│ │Lesson    │ │Teaching  │         │  │
│  │  │Breakdown │ │Plan      │ │Notes     │         │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘         │  │
│  │       │             │             │               │  │
│  │  ┌────┴─────────────┴─────────────┴────┐         │  │
│  │  │ Card 4: Teacher Development         │         │  │
│  │  └─────────────────────────────────────┘         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  /dashboard/ai-tools/curriculum                 │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Input Form                                │  │  │
│  │  │  - Subject input                           │  │  │
│  │  │  - Grade level input                       │  │  │
│  │  │  - Days input                              │  │  │
│  │  │  - Content textarea (large)                │  │  │
│  │  │  - Generate button                         │  │  │
│  │  └────┬───────────────────────────────────────┘  │  │
│  │       │                                             │  │
│  │  ┌────▼───────────────────────────────────────┐  │  │
│  │  │  Output Display (after generation)         │  │  │
│  │  │  - Session cards (Title, Objectives, etc)  │  │  │
│  │  │  - Download JSON button                    │  │  │
│  │  │  - Create new button                       │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Similar structure for: lesson-generator,              │
│  teaching-notes, teacher-development pages            │
└──────────────────────────────────────────────────────────┘
```

## Data Processing Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                   CURRICULUM BREAKDOWN                   │
└─────────────────────────────────────────────────────────┘

User Input ──→ Form Validation ──→ API Call
                                      ↓
                            AI Processing
                            (30-60 sec)
                                      ↓
                            JSON Parsing
                                      ↓
                            Display Sessions
                                      ↓
                            Download Option

┌─────────────────────────────────────────────────────────┐
│                  LESSON PLAN GENERATOR                   │
└─────────────────────────────────────────────────────────┘

Resources + Objectives ──→ Validation ──→ API Call
                                           ↓
                                  AI Processing
                                  (20-45 sec)
                                           ↓
                                  Parse JSON
                                           ↓
                                  Display Plan
                                           ↓
                                  Download

┌─────────────────────────────────────────────────────────┐
│                   TEACHING NOTES                         │
└─────────────────────────────────────────────────────────┘

Lesson Plan ──→ Validation ──→ API Call
                                  ↓
                          AI Processing
                          (45-90 sec)
                                  ↓
                          Parse Output
                                  ↓
                          Display Notes
                                  ↓
                          Download

┌─────────────────────────────────────────────────────────┐
│              TEACHER PROFESSIONAL DEVELOPMENT             │
└─────────────────────────────────────────────────────────┘

Training Materials ──→ Validation ──→ API Call
   (notes, articles,              ↓
    workshop content)      AI Processing
                          (60-120 sec)
                                  ↓
                          Parse Plan
                                  ↓
                          Display Goals
                                  ↓
                          Download Roadmap
```

## State Management (React)

### Curriculum Breakdown Page State
```
└─ CurriculumBreakdownPage
   ├─ content (string) - user's textbook content
   ├─ learningDays (string) - number of days
   ├─ subject (string) - subject name
   ├─ gradeLevel (string) - grade level
   ├─ loading (boolean) - API call in progress
   ├─ result (object) - parsed AI output
   └─ error (string) - error message if any
```

Similar pattern for all 4 AI tool pages.

## Integration Points

```
AI Tools ←─→ Existing Platform

Curriculum ←─→ Calendar
  Sessions     (dates)
  
Lesson Plans ←─→ Lessons Module
  Generated    (save as lesson)
  Plans
  
Teaching Notes ←─→ Lesson Details
  (attached to lessons)
  
Development Plans ←─→ Progress Module
  (tracked progress)
```

## Error Handling Flow

```
User Action
    ↓
Input Validation
    ├─ Pass ──→ API Call
    │           ├─ Success ──→ Display Results
    │           └─ Failure ──→ Error Display
    │
    └─ Fail ──→ Show Error Message
                ↓
            User Can:
            - Fix input and retry
            - Clear form and start over
```

## File Structure Summary

```
PRIME Teaching Platform
├── app/
│   ├── api/ai/
│   │   ├── curriculum-breakdown/route.ts (50 lines)
│   │   ├── lesson-plan/route.ts (63 lines)
│   │   ├── teaching-notes/route.ts (91 lines)
│   │   └── teacher-development/route.ts (110 lines)
│   └── dashboard/
│       ├── ai-tools/
│       │   ├── page.tsx (84 lines) ← Hub
│       │   ├── curriculum/page.tsx (230 lines)
│       │   ├── lesson-generator/page.tsx (210 lines)
│       │   ├── teaching-notes/page.tsx (215 lines)
│       │   └── teacher-development/page.tsx (220 lines)
│       └── [other existing pages]
├── components/
│   ├── dashboard/
│   │   ├── sidebar.tsx (updated with AI Tools)
│   │   └── [other components]
│   └── ui/
│       └── textarea.tsx (already exists)
├── AI_FEATURES_GUIDE.md (300 lines)
├── AI_IMPLEMENTATION_SUMMARY.md (463 lines)
├── QUICK_START_AI.md (216 lines)
└── AI_ARCHITECTURE.md (this file)
```

---

## Environment & Dependencies

```
Environment Variables:
  - Vercel AI Gateway (automatic)
  - OpenAI API key (via Vercel)
  
Dependencies Added:
  - ai@^6.0.175
  - @ai-sdk/react@^3.0.177
  - zod@^3.x
  
No additional configuration needed!
```

---

**Architecture designed for** ✅
- Scalability
- Maintainability  
- Security
- Performance
- User Experience

