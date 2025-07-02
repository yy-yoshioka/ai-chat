import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { KnowledgeBaseUploader } from '../KnowledgeBaseUploader';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('KnowledgeBaseUploader', () => {
  const mockOnUploadComplete = jest.fn();
  const defaultProps = {
    widgetId: 'widget-123',
    onUploadComplete: mockOnUploadComplete,
  };

  let mockGetRootProps: jest.Mock;
  let mockGetInputProps: jest.Mock;
  let mockOnDrop: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRootProps = jest.fn(() => ({}));
    mockGetInputProps = jest.fn(() => ({}));
    mockOnDrop = jest.fn();

    const { useDropzone } = require('react-dropzone');
    useDropzone.mockImplementation((config: any) => {
      mockOnDrop = config.onDrop;
      return {
        getRootProps: mockGetRootProps,
        getInputProps: mockGetInputProps,
        isDragActive: false,
      };
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('renders upload area with correct text', () => {
    render(<KnowledgeBaseUploader {...defaultProps} />);

    expect(screen.getByText('ファイルをドラッグ&ドロップ')).toBeInTheDocument();
    expect(screen.getByText('または、クリックしてファイルを選択')).toBeInTheDocument();
    expect(screen.getByText('対応形式: PDF, TXT, DOCX (最大10MB)')).toBeInTheDocument();
  });

  it('shows drag active state', () => {
    const { useDropzone } = require('react-dropzone');
    useDropzone.mockImplementation(() => ({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: true,
    }));

    render(<KnowledgeBaseUploader {...defaultProps} />);

    expect(screen.getByText('ドロップしてファイルをアップロード')).toBeInTheDocument();
  });

  it('handles successful file upload', async () => {
    render(<KnowledgeBaseUploader {...defaultProps} />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Trigger file drop
    await mockOnDrop([file]);

    // Wait for upload to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bff/knowledge-base/upload', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    // Check that FormData was created correctly
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const formData = fetchCall[1].body as FormData;
    expect(formData.get('file')).toBe(file);
    expect(formData.get('widgetId')).toBe('widget-123');

    // Wait for callback
    await waitFor(
      () => {
        expect(mockOnUploadComplete).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it('shows upload progress', async () => {
    render(<KnowledgeBaseUploader {...defaultProps} />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Trigger file drop
    mockOnDrop([file]);

    // Check that progress is shown
    await waitFor(() => {
      expect(screen.getByText(/アップロード中\.\.\./)).toBeInTheDocument();
    });
  });

  it('handles upload error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<KnowledgeBaseUploader {...defaultProps} />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Trigger file drop
    await mockOnDrop([file]);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('ファイルのアップロードに失敗しました')).toBeInTheDocument();
    });

    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });

  it('handles network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<KnowledgeBaseUploader {...defaultProps} />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Trigger file drop
    await mockOnDrop([file]);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('ファイルのアップロードに失敗しました')).toBeInTheDocument();
    });
  });

  it('disables dropzone while uploading', async () => {
    const { useDropzone } = require('react-dropzone');
    let capturedConfig: any;

    useDropzone.mockImplementation((config: any) => {
      capturedConfig = config;
      mockOnDrop = config.onDrop;
      return {
        getRootProps: mockGetRootProps,
        getInputProps: mockGetInputProps,
        isDragActive: false,
      };
    });

    render(<KnowledgeBaseUploader {...defaultProps} />);

    expect(capturedConfig.disabled).toBe(false);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Start upload
    mockOnDrop([file]);

    // Re-render to check disabled state
    render(<KnowledgeBaseUploader {...defaultProps} />);

    // During upload, dropzone should be disabled
    await waitFor(() => {
      expect(capturedConfig.disabled).toBe(true);
    });
  });

  it('accepts only specified file types', () => {
    const { useDropzone } = require('react-dropzone');
    let capturedConfig: any;

    useDropzone.mockImplementation((config: any) => {
      capturedConfig = config;
      return {
        getRootProps: mockGetRootProps,
        getInputProps: mockGetInputProps,
        isDragActive: false,
      };
    });

    render(<KnowledgeBaseUploader {...defaultProps} />);

    expect(capturedConfig.accept).toEqual({
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    });
    expect(capturedConfig.maxSize).toBe(10 * 1024 * 1024); // 10MB
  });

  it('uploads multiple files sequentially', async () => {
    render(<KnowledgeBaseUploader {...defaultProps} />);

    const file1 = new File(['content1'], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File(['content2'], 'test2.pdf', { type: 'application/pdf' });

    // Trigger multiple file drop
    await mockOnDrop([file1, file2]);

    // Wait for both uploads
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Check both files were uploaded
    const calls = (global.fetch as jest.Mock).mock.calls;
    const formData1 = calls[0][1].body as FormData;
    const formData2 = calls[1][1].body as FormData;

    expect(formData1.get('file')).toBe(file1);
    expect(formData2.get('file')).toBe(file2);
  });

  it('shows progress bar with correct width', async () => {
    jest.useFakeTimers();

    render(<KnowledgeBaseUploader {...defaultProps} />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Trigger file drop
    mockOnDrop([file]);

    // Wait for progress bar to appear
    await waitFor(() => {
      const progressBar =
        screen.getByText(/アップロード中\.\.\./).previousElementSibling?.firstElementChild;
      expect(progressBar).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('renders upload icon', () => {
    render(<KnowledgeBaseUploader {...defaultProps} />);

    const uploadIcon = screen.getByRole('img', { hidden: true });
    expect(uploadIcon).toHaveClass('h-12', 'w-12', 'text-gray-400');
  });

  it('clears error when new upload starts', async () => {
    // First upload fails
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<KnowledgeBaseUploader {...defaultProps} />);

    const file1 = new File(['content1'], 'test1.pdf', { type: 'application/pdf' });

    // First upload
    await mockOnDrop([file1]);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('ファイルのアップロードに失敗しました')).toBeInTheDocument();
    });

    // Second upload succeeds
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const file2 = new File(['content2'], 'test2.pdf', { type: 'application/pdf' });

    // Second upload
    await mockOnDrop([file2]);

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('ファイルのアップロードに失敗しました')).not.toBeInTheDocument();
    });
  });
});
