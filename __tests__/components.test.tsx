import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RiskBar } from '@/app/components/RiskBar';
import { CyberButton } from '@/app/components/CyberButton';
import { CyberInput } from '@/app/components/CyberInput';

describe('Component Tests', () => {
  describe('RiskBar', () => {
    it('should render low risk score', () => {
      render(<RiskBar score={25} />);
      expect(screen.getByText(/25\/100/i)).toBeInTheDocument();
      expect(screen.getByText(/Low Risk/i)).toBeInTheDocument();
    });

    it('should render medium risk score', () => {
      render(<RiskBar score={45} />);
      expect(screen.getByText(/45\/100/i)).toBeInTheDocument();
      expect(screen.getByText(/Medium Risk/i)).toBeInTheDocument();
    });

    it('should render high risk score', () => {
      render(<RiskBar score={75} />);
      expect(screen.getByText(/75\/100/i)).toBeInTheDocument();
      expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
    });

    it('should display risk score label', () => {
      render(<RiskBar score={50} label="Custom Label" />);
      expect(screen.getByText(/Custom Label/i)).toBeInTheDocument();
    });
  });

  describe('CyberButton', () => {
    it('should render button', () => {
      render(<CyberButton>Test Button</CyberButton>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<CyberButton onClick={handleClick}>Click Me</CyberButton>);
      
      const button = screen.getByText('Click Me');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<CyberButton disabled>Disabled</CyberButton>);
      expect(screen.getByText('Disabled')).toBeDisabled();
    });

    it('should support different variants', () => {
      const { rerender } = render(<CyberButton variant="primary">Primary</CyberButton>);
      expect(screen.getByText('Primary')).toBeInTheDocument();
      
      rerender(<CyberButton variant="success">Success</CyberButton>);
      expect(screen.getByText('Success')).toBeInTheDocument();
      
      rerender(<CyberButton variant="secondary">Secondary</CyberButton>);
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });

    it('should support different sizes', () => {
      render(<CyberButton size="sm">Small</CyberButton>);
      expect(screen.getByText('Small')).toBeInTheDocument();
      
      render(<CyberButton size="md">Medium</CyberButton>);
      expect(screen.getByText('Medium')).toBeInTheDocument();
      
      render(<CyberButton size="lg">Large</CyberButton>);
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });

  describe('CyberInput', () => {
    it('should render input', () => {
      render(<CyberInput value="" onChange={() => {}} placeholder="Enter URL" />);
      expect(screen.getByPlaceholderText('Enter URL')).toBeInTheDocument();
    });

    it('should update value on change', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<CyberInput value="" onChange={handleChange} placeholder="URL" />);
      
      const input = screen.getByPlaceholderText('URL');
      await user.type(input, 'https://example.com');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should display initial value', () => {
      render(<CyberInput value="https://example.com" onChange={() => {}} placeholder="URL" />);
      const input = screen.getByPlaceholderText('URL') as HTMLInputElement;
      expect(input.value).toBe('https://example.com');
    });

    it('should support multiline input', () => {
      render(<CyberInput value="" onChange={() => {}} multiline rows={5} placeholder="Batch URLs" />);
      const textarea = screen.getByPlaceholderText('Batch URLs') as HTMLTextAreaElement;
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });
});
