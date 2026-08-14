import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JsonStatsSection from './JsonStatsSection';

describe('JsonStatsSection', () => {
  const sampleJsonStats = {
    totalElements: 15,
    uniqueKeys: 12,
    depth: 4,
    isArray: false,
    formElements: 10,
  };

  const sampleLabels = [
    { label: 'First Name', key: 'firstName', type: 'textfield' },
    { label: 'Last Name', key: 'lastName', type: 'textfield' },
    { label: 'Department', key: 'dept', type: 'select', multiple: false },
    { label: 'Roles', key: 'roles', type: 'select', multiple: true },
    { label: 'Gender', key: 'gender', type: 'radio' },
    { label: 'HTML Content', key: 'content1', type: 'content' },
    { label: 'Col Layout', key: 'col1', type: 'column' },
    { label: 'Cols Layout', key: 'cols1', type: 'columns' },
    { label: 'Personal Info', key: 'panel1', type: 'panel' },
    { label: 'Title Panel', key: 'Panel2', type: 'Panel' },
    { label: 'Submit', key: 'submit', type: 'button' },
  ];

  it('renders statistics and component usage excluding content, column, columns, panel', () => {
    render(<JsonStatsSection jsonStats={sampleJsonStats} labels={sampleLabels} />);

    // Check main JSON stats badge
    expect(screen.getByText(/15 elements/i)).toBeInTheDocument();

    // Expand accordion card
    fireEvent.click(screen.getByText('JSON Statistics'));

    // Check component usage section
    expect(screen.getByText('Component Usage Statistics')).toBeInTheDocument();

    // textfield: 2
    expect(screen.getByText('textfield')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // select: 1
    expect(screen.getByText('select')).toBeInTheDocument();

    // multiselect: 1
    expect(screen.getByText('multiselect')).toBeInTheDocument();

    // radio: 1
    expect(screen.getByText('radio')).toBeInTheDocument();

    // button: 1
    expect(screen.getByText('button')).toBeInTheDocument();

    // Skipped types: content, column, columns, panel, Panel should NOT be displayed
    expect(screen.queryByText('content')).not.toBeInTheDocument();
    expect(screen.queryByText('column')).not.toBeInTheDocument();
    expect(screen.queryByText('columns')).not.toBeInTheDocument();
    expect(screen.queryByText('panel')).not.toBeInTheDocument();
    expect(screen.queryByText('Panel')).not.toBeInTheDocument();
  });
});
