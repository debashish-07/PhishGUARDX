import '@testing-library/jest-dom';
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalysisCard } from '@/app/components/AnalysisCard';
import { Toast, ToastContainer } from '@/app/components/Toast';
import { LoadingSpinner, CyberLoader } from '@/app/components/LoadingSpinner';
import { ExplainPanel } from '@/app/components/ExplainPanel';

describe('Extended Component Tests', () => {
  describe('AnalysisCard', () => {
    it('should render analysis card with all details', () => {
      const timestamp = Date.now();
      render(
        <AnalysisCard
          title="Test Analysis"
          score={75}
          url="https://example.com"
          timestamp={timestamp}
        />
      );

      expect(screen.getByText('Test Analysis')).toBeInTheDocument();
      expect(screen.getByText('75/100')).toBeInTheDocument();
      expect(screen.getByText(/https:\/\/example\.com/i)).toBeInTheDocument();
      expect(screen.getByText(new Date(timestamp).toLocaleString())).toBeInTheDocument();
    });

    it('should display low risk styling', () => {
      render(
        <AnalysisCard
          title="Low Risk"
          score={25}
          url="https://example.com"
          timestamp={Date.now()}
        />
      );

      const scoreElement = screen.getByText('25/100');
      expect(scoreElement).toHaveClass('text-cyber-teal-primary');
    });

    it('should display high risk styling', () => {
      render(
        <AnalysisCard
          title="High Risk"
          score={80}
          url="https://example.com"
          timestamp={Date.now()}
        />
      );

      const scoreElement = screen.getByText('80/100');
      expect(scoreElement).toHaveClass('text-cyber-danger-primary');
    });

    it('should render details when provided', () => {
      const details = {
        suspicious_tokens: true,
        ip_address: true,
        obfuscation: false,
      };

      render(
        <AnalysisCard
          title="With Details"
          score={50}
          url="https://example.com"
          timestamp={Date.now()}
          details={details}
        />
      );

      expect(screen.getByText(/suspicious_tokens: true/i)).toBeInTheDocument();
      expect(screen.getByText(/ip_address: true/i)).toBeInTheDocument();
    });

    it('should display progress bar with correct width', () => {
      const { container } = render(
        <AnalysisCard
          title="Progress Test"
          score={60}
          url="https://example.com"
          timestamp={Date.now()}
        />
      );

      const progressBar = container.querySelector('[style*="width"]');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '60%' });
    });
  });

  describe('Toast', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should render success toast', () => {
      const onClose = jest.fn();
      render(<Toast message="Success!" type="success" onClose={onClose} />);

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument(); // Close button
    });

    it('should render error toast', () => {
      const onClose = jest.fn();
      render(<Toast message="Error occurred" type="error" onClose={onClose} />);

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('should render warning toast', () => {
      const onClose = jest.fn();
      render(<Toast message="Warning!" type="warning" onClose={onClose} />);

      expect(screen.getByText('Warning!')).toBeInTheDocument();
    });

    it('should render info toast', () => {
      const onClose = jest.fn();
      render(<Toast message="Information" type="info" onClose={onClose} />);

      expect(screen.getByText('Information')).toBeInTheDocument();
    });

    it('should close when close button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onClose = jest.fn();
      
      render(<Toast message="Test" type="info" onClose={onClose} />);

      const closeButton = screen.getByRole('button');
      await user.click(closeButton);

      // Fast-forward timers to allow animation to complete
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should auto-close after duration', async () => {
      const onClose = jest.fn();
      render(<Toast message="Auto close" type="info" duration={1000} onClose={onClose} />);

      expect(screen.getByText('Auto close')).toBeInTheDocument();

      // Fast-forward past duration
      act(() => {
        jest.advanceTimersByTime(1300);
      });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('ToastContainer', () => {
    it('should render multiple toasts', () => {
      const toasts = [
        { id: '1', message: 'First toast', type: 'success' as const },
        { id: '2', message: 'Second toast', type: 'error' as const },
      ];

      const removeToast = jest.fn();
      render(<ToastContainer toasts={toasts} removeToast={removeToast} />);

      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();
    });

    it('should render empty container when no toasts', () => {
      const removeToast = jest.fn();
      const { container } = render(<ToastContainer toasts={[]} removeToast={removeToast} />);

      // Container should exist but be empty
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.queryByText(/toast/i)).not.toBeInTheDocument();
    });
  });

  describe('LoadingSpinner', () => {
    it('should render spinner with default size', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render small spinner', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinner = container.querySelector('.w-4.h-4');
      expect(spinner).toBeInTheDocument();
    });

    it('should render large spinner', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const spinner = container.querySelector('.w-12.h-12');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('CyberLoader', () => {
    it('should render with default message', () => {
      render(<CyberLoader />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      render(<CyberLoader message="Analyzing threats..." />);
      expect(screen.getByText('Analyzing threats...')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      const { container } = render(<CyberLoader />);
      const progressBar = container.querySelector('.animate-pulse');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('ExplainPanel', () => {
    const mockAttributions = [
      { token: 'paypal', importance: 0.9 },
      { token: 'secure', importance: 0.7 },
      { token: 'login', importance: 0.6 },
      { token: 'verify', importance: 0.5 },
    ];

    const mockHeatmapRanges = [
      { start: 0, end: 6, weight: 0.8 },
      { start: 7, end: 13, weight: 0.6 },
      { start: 14, end: 18, weight: 0.4 },
    ];

    it('should render explain panel with title', () => {
      render(
        <ExplainPanel
          attributions={mockAttributions}
          heatmapRanges={mockHeatmapRanges}
          url="https://example.com"
        />
      );

      expect(screen.getByText('Explainability Analysis')).toBeInTheDocument();
    });

    it('should display top risk factors', () => {
      const { container } = render(
        <ExplainPanel
          attributions={mockAttributions}
          heatmapRanges={mockHeatmapRanges}
          url="https://example.com"
        />
      );

      expect(screen.getByText('Top Risk Factors')).toBeInTheDocument();
      // Check that risk factors are displayed (may appear multiple times)
      expect(container.textContent).toMatch(/paypal/i);
      expect(container.textContent).toMatch(/secure/i);
    });

    it('should display URL analysis section', () => {
      const { container } = render(
        <ExplainPanel
          attributions={mockAttributions}
          heatmapRanges={mockHeatmapRanges}
          url="https://example.com"
        />
      );

      expect(screen.getByText('URL Analysis')).toBeInTheDocument();
      // URL should be visible in the container (may be split into characters)
      expect(container.textContent).toContain('example');
    });

    it('should display feature importance section', () => {
      render(
        <ExplainPanel
          attributions={mockAttributions}
          heatmapRanges={mockHeatmapRanges}
          url="https://example.com"
        />
      );

      expect(screen.getByText('Feature Importance')).toBeInTheDocument();
    });

    it('should display importance percentages', () => {
      const { container } = render(
        <ExplainPanel
          attributions={mockAttributions}
          heatmapRanges={mockHeatmapRanges}
          url="https://example.com"
        />
      );

      // Should show 90% for paypal (0.9 * 100)
      expect(container.textContent).toMatch(/90%/i);
      // Should show 70% for secure (0.7 * 100)
      expect(container.textContent).toMatch(/70%/i);
    });

    it('should render heatmap for URL', () => {
      const { container } = render(
        <ExplainPanel
          attributions={mockAttributions}
          heatmapRanges={mockHeatmapRanges}
          url="https://example.com"
        />
      );

      // URL should be split into characters with styling
      const urlContainer = container.querySelector('.font-mono');
      expect(urlContainer).toBeInTheDocument();
      // Check that URL characters are present (may be split across spans)
      expect(container.textContent).toMatch(/example/i);
    });
  });
});

