import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render without crashing', () => {
    const { container } = render(<Button label='Test' />);
    expect(container).toBeTruthy();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button label='Click Me' onClick={handleClick} />);

    const button = screen.getByText('Click Me');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });

  it('should respect disabled state', () => {
    const handleClick = jest.fn();
    render(<Button label='Disabled' onClick={handleClick} disabled />);

    const button = screen.getByText('Disabled');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
