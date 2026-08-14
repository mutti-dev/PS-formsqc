import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ValidationSection from './ValidationSection';

describe('ValidationSection', () => {
  const sampleIssues = [
    {
      type: 'label_key_mismatch',
      severity: 'warning',
      field: 'First Name',
      key: 'first_name',
      expected: 'firstName',
      path: ['components', 0],
      message: 'Label and Key mismatch: "First Name" should have key "firstName", not "first_name"',
    },
    {
      type: 'reserved_column',
      severity: 'error',
      field: 'Created At',
      key: 'created_at',
      message: 'Field key "created_at" conflicts with reserved database column "created_at"',
    },
  ];

  const sampleSteps = [
    { step: 'JSON syntax validation', success: true, details: 'Valid JSON format' },
    { step: 'Container validation', success: true, details: 'Single valid container found' },
  ];

  it('renders executive summary statistics and health score', () => {
    render(<ValidationSection validationIssues={sampleIssues} parsingSteps={sampleSteps} />);

    expect(screen.getByText('Validation & Quality Control')).toBeInTheDocument();
    expect(screen.getByText('Critical Errors')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByText('Warnings')).toBeInTheDocument();
  });

  it('renders issue cards with current vs expected key diffs', () => {
    render(<ValidationSection validationIssues={sampleIssues} parsingSteps={sampleSteps} />);

    expect(screen.getByText(/Label and Key mismatch/i)).toBeInTheDocument();
    expect(screen.getByText('first_name')).toBeInTheDocument();
    expect(screen.getByText('firstName')).toBeInTheDocument();
  });

  it('filters issues using search input', () => {
    render(<ValidationSection validationIssues={sampleIssues} parsingSteps={sampleSteps} />);

    const searchInput = screen.getByPlaceholderText(/Search issues by field, key, or message/i);
    fireEvent.change(searchInput, { target: { value: 'reserved' } });

    expect(screen.getByText(/conflicts with reserved database column/i)).toBeInTheDocument();
    expect(screen.queryByText(/Label and Key mismatch/i)).not.toBeInTheDocument();
  });

  it('calls onFixIssue when Quick Fix button is clicked', () => {
    const handleFixIssue = jest.fn();
    render(
      <ValidationSection
        validationIssues={sampleIssues}
        parsingSteps={sampleSteps}
        onFixIssue={handleFixIssue}
      />
    );

    const quickFixButton = screen.getByRole('button', { name: /Quick Fix/i });
    fireEvent.click(quickFixButton);

    expect(handleFixIssue).toHaveBeenCalledWith(sampleIssues[0]);
  });

  it('calls onFixAll when Auto-Fix All button is clicked', () => {
    const handleFixAll = jest.fn();
    render(
      <ValidationSection
        validationIssues={sampleIssues}
        parsingSteps={sampleSteps}
        onFixAll={handleFixAll}
      />
    );

    const autoFixAllButton = screen.getByRole('button', { name: /Auto-Fix All/i });
    fireEvent.click(autoFixAllButton);

    expect(handleFixAll).toHaveBeenCalled();
  });

  it('renders and supports quick-fixing for key_length_exceeded error issues', () => {
    const keyLengthIssue = [
      {
        type: 'key_length_exceeded',
        severity: 'error',
        field: 'Very Long Field Label',
        key: 'very_long_field_label_that_exceeds_the_maximum_limit_of_characters_and_is_too_long_for_database_storage_rules',
        expected: 'very_long_field_label_that_exceeds_the_maximum_limit_of_characters',
        path: ['components', 2],
        message: 'Field key length exceeds maximum limit of 110 characters',
      },
    ];
    const handleFixIssue = jest.fn();
    render(
      <ValidationSection
        validationIssues={keyLengthIssue}
        parsingSteps={sampleSteps}
        onFixIssue={handleFixIssue}
      />
    );

    expect(screen.getByText(/Key Length Exceeded/i)).toBeInTheDocument();
    expect(screen.getByText('ERROR')).toBeInTheDocument();

    const quickFixButton = screen.getByRole('button', { name: /Quick Fix/i });
    fireEvent.click(quickFixButton);

    expect(handleFixIssue).toHaveBeenCalledWith(keyLengthIssue[0]);
  });

  it('toggles system execution trace log', () => {
    render(<ValidationSection validationIssues={sampleIssues} parsingSteps={sampleSteps} />);

    const traceButton = screen.getByRole('button', { name: /Execution Trace/i });
    fireEvent.click(traceButton);

    expect(screen.getByText(/System Parsing Execution Trace/i)).toBeInTheDocument();
    expect(screen.getByText(/JSON syntax validation/i)).toBeInTheDocument();
  });
});
