# Project Report: FormsQC

## Overview
FormsQC is a React-based web application designed for quality control and analysis of form structures, particularly those defined in JSON format. The application provides tools for extracting, comparing, formatting, and converting form data, with a focus on identifying duplicates, conditions, and other quality metrics.

**Project Name:** formsqc  
**Version:** 0.1.0  
**Technology Stack:** React 19, Bootstrap 5, React Router, TanStack React Table, XLSX for Excel export  
**Build Tool:** Create React App  

## Project Structure
The project follows a standard React application structure with the following key directories:

- **src/**: Main source code
  - **screens/**: Main application screens/pages
    - `FormComparator.js`: Compares two JSON form structures
    - `JSONExtractor.js`: Extracts and analyzes form components from JSON
    - `JSONFormatter.js`: Formats and validates JSON data
    - `TextConverter.js`: Converts text with various transformations
    - `WordConverter.js`: Converts words/keys with specific rules
  - **common/**: Reusable components
    - `SideDrawer.jsx`: Navigation sidebar
    - `CollapsibleSection.jsx`: Collapsible UI sections
    - **sections/**: Specialized sections for different analysis types
      - `ConditionsSection.jsx`: Displays form conditions
      - `DuplicateAPISection.jsx`: Shows duplicate API calls
      - `DuplicateLabelsSection.jsx`: Identifies duplicate labels
      - `DuplicateRadioValuesSection.jsx`: Finds duplicate radio values
      - `DuplicateSurveyValuesSection.jsx`: Finds duplicate survey values
      - `DuplicateValuesSection.jsx`: General duplicate values detection
      - `JsonStatsSection.jsx`: JSON statistics
      - `KeyLengthWarningsSection.jsx`: Key length validation
      - `RadioComponentsSection.jsx`: Radio component analysis
      - `SelectComponentsSection.jsx`: Select component analysis
      - `SurveyComponentsSection.jsx`: Survey component analysis
      - `TypeFilterSection.jsx`: Type filtering
      - `index.jsx`: Section exports
  - **utils/**: Utility functions
    - `exportUtils.js`: Export functionality
    - `jsonUtils.js`: JSON manipulation utilities
    - `utils.js`: General utility functions
- **public/**: Static assets
- **build/**: Production build output

## Application Screens
1. **JSON Extractor** (`/extractor`): Main screen for extracting and analyzing form components from JSON data
2. **Word Converter** (`/converter`): Tool for converting words/keys according to specific rules
3. **Form Comparator** (`/form`): Compares two different form JSON structures
4. **JSON Formatter** (`/jsonformatter`): Formats and validates JSON strings
5. **Text Converter** (`/textconverter`): General text conversion utilities

## Utils and Their Functions

### utils.js
This file contains core utility functions for form analysis and data extraction:

- **`extractLabelsFromJSON(json, currentPath, results)`**: Recursively extracts labels, keys, and types from JSON form structures, including path information for nested elements.

- **`extractConditions(json)`**: Extracts conditional logic and custom conditionals from form components, identifying affected fields through regex parsing of JavaScript code.

- **`extractSelectValues(jsonData)`**: Extracts select component values and detects duplicate values within select options.

- **`extractSurveyValues(jsonData)`**: Extracts survey component questions and detects duplicate values within survey questions.

- **`extractRadioValues(jsonData)`**: Extracts radio component values and detects duplicate values within radio options.

- **`deepCompareJSON(data1, data2)`**: Compares two arrays of extracted form entries and reports differences (missing fields, type mismatches).

- **`copyToClipboard(text)`**: Copies text to clipboard with fallback for older browsers.

- **`convertText(input)`**: Converts text by replacing non-alphanumeric characters with underscores and removing leading numbers.

- **`limitText(input, maxLength)`**: Converts text and limits it to a maximum length (default 110 characters), trimming leading/trailing underscores.

### jsonUtils.js
This file provides JSON parsing and manipulation utilities:

- **`parseJson(input)`**: Safely parses JSON strings, returning the input if parsing fails.

- **`deepParse(obj)`**: Recursively parses nested JSON strings within objects and arrays.

- **`parseDoublyEscapedJson(jsonString)`**: Handles parsing of doubly escaped JSON strings, common in form configurations.

- **`extractFormJson(input)`**: Extracts form structure from various JSON formats, using multiple parsing strategies to find the components array.

- **`searchKeysInObject(obj, keysToFind)`**: Searches for specific keys within a JSON object and returns their paths and values.

- **`formatJsonString(jsonObj)`**: Formats a JSON object as a pretty-printed string.

- **`isValidJson(jsonString)`**: Validates whether a string is valid JSON.

- **`highlightJsonSyntax(jsonString)`**: Adds HTML syntax highlighting to JSON strings for display.

- **`extractJsonKeys(jsonObj)`**: Extracts all unique keys from a JSON object recursively.

- **`countJsonElements(jsonObj)`**: Counts the total number of elements (objects and arrays) in a JSON structure.

### exportUtils.js
This file handles data export functionality:

- **`exportToExcel(data, hiddenTypes)`**: Exports filtered form label data to an Excel file, excluding specified component types.

- **`exportJsonData(data, jsonStats, searchResults, hiddenTypes)`**: Exports comprehensive analysis data (labels, statistics, search results) to a JSON file with metadata.

## Dependencies
Key dependencies include:
- **React 19**: UI framework
- **React Router 7**: Client-side routing
- **Bootstrap 5**: CSS framework
- **TanStack React Table**: Data table component
- **XLSX**: Excel file generation
- **React Bootstrap**: Bootstrap components for React

## Build and Scripts
- `npm start`: Runs development server
- `npm build`: Creates production build
- `npm test`: Runs test suite
- `npm eject`: Ejects from Create React App (irreversible)

## Usage
The application is designed for form developers and quality assurance teams to analyze and validate form structures, identify potential issues like duplicate values or missing fields, and export analysis results for documentation or further processing.</content>
<parameter name="filePath">e:\_Github Projects\PS-formsqc\PROJECT_REPORT.md