import React from 'react';
import { render, screen } from '@testing-library/react';
import WordConverter from './screens/WordConverter';

test('renders text & word tools page header', () => {
  render(<WordConverter theme="dark" />);
  const headerElement = screen.getByText(/Text & Word Converter/i);
  expect(headerElement).toBeInTheDocument();
});
