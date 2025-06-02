import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AddPost from '../AddPost'; // Adjust path as necessary
import { Alert } from 'react-native';

// Mock Firebase and other external dependencies
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({
    user: {
      fullName: 'Test User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      imageUrl: 'http://example.com/user.jpg',
      id: 'user_123',
    },
  }),
}));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react'); // Require React inside the mock factory
  // const RealPicker = jest.requireActual('@react-native-picker/picker').Picker;
  const MockPicker = ({ children, selectedValue, onValueChange, ...props }) => {
    // Using React.createElement to avoid JSX issues in mock files if not transformed
    // Also, pass through other props like style, testID etc.
    return React.createElement('mock-Picker', { selectedValue, onValueChange, ...props }, children);
  };
  MockPicker.Item = ({ label, value }) => React.createElement('mock-Picker.Item', { label, value });
  return { Picker: MockPicker };
});


// Mock ImagePicker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{ uri: 'file://test-image.jpg' }],
  })),
  MediaTypeOptions: { All: 'All' },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve('mock-blob'),
  })
);

describe('AddPost Screen', () => {
  // Mock implementations for Firebase functions
  const mockUploadBytes = require('firebase/storage').uploadBytes;
  const mockGetDownloadURL = require('firebase/storage').getDownloadURL;
  const mockAddDoc = require('firebase/firestore').addDoc;
  const mockGetDocs = require('firebase/firestore').getDocs;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Provide a default successful resolution for getDocs to populate category list
    mockGetDocs.mockResolvedValue({
      forEach: (callback) => callback({ data: () => ({ name: 'Electronics' }) })
    });
  });

  it('should set loading to false and show error alert if image upload fails', async () => {
    // Simulate an error during image upload
    const uploadError = new Error('Upload failed');
    mockUploadBytes.mockRejectedValueOnce(uploadError);

    const { getByText, getByPlaceholderText, getByTestId } = render(<AddPost />);

    // Simulate picking an image
    fireEvent.press(getByTestId('image-picker-touchable'));
    // Wait for image to be "selected" (mocked)
    await waitFor(() => expect(require('expo-image-picker').launchImageLibraryAsync).toHaveBeenCalled());

    // Fill in form details
    fireEvent.changeText(getByPlaceholderText('Title'), 'Test Post');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Test Description');
    // fireEvent.changeText(getByPlaceholderText('City'), 'Test City');
    // Picker interaction might be needed if it affects submission, but not strictly for this error path

    // Trigger form submission
    // Using act to handle state updates properly
    await act(async () => {
      fireEvent.press(getByText('Submit'));
    });

    // Assertions
    await waitFor(() => {
      // Check if Alert was called with the error message
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Failed to donate item. Please try again.");
    });

    // Check if the loading indicator is gone (Submit button text is back to 'Submit')
    // This indirectly checks if setLoading(false) was called in .finally()
    expect(getByText('Submit')).toBeTruthy();
    // We can also check that the ActivityIndicator is not visible if we query for it by testID when loading.
    // For example, if ActivityIndicator had testID="loading-indicator", we could do:
    // expect(queryByTestId('loading-indicator')).toBeNull();


    // Verify that addDoc was not called because the process failed before that
    expect(mockAddDoc).not.toHaveBeenCalled();
    expect(mockGetDownloadURL).not.toHaveBeenCalled(); // Should not be called if uploadBytes fails
  });

  it('should set loading to false and show error alert if Firestore submission fails', async () => {
    // Simulate successful image upload but an error during Firestore submission
    mockUploadBytes.mockResolvedValueOnce({ snapshot: 'mock-snapshot' });
    mockGetDownloadURL.mockResolvedValueOnce('http://example.com/image.jpg');
    const firestoreError = new Error('Firestore submission failed');
    mockAddDoc.mockRejectedValueOnce(firestoreError);

    const { getByText, getByPlaceholderText, getByTestId } = render(<AddPost />);

    // Simulate picking an image
    fireEvent.press(getByTestId('image-picker-touchable'));
    await waitFor(() => expect(require('expo-image-picker').launchImageLibraryAsync).toHaveBeenCalled());

    // Fill in form details
    fireEvent.changeText(getByPlaceholderText('Title'), 'Test Post Firestore');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Test Description Firestore');

    // Trigger form submission
    await act(async () => {
      fireEvent.press(getByText('Submit'));
    });

    // Assertions
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Failed to donate item. Please try again.");
    });

    expect(getByText('Submit')).toBeTruthy();
    expect(mockUploadBytes).toHaveBeenCalled();
    expect(mockGetDownloadURL).toHaveBeenCalled();
    expect(mockAddDoc).toHaveBeenCalled(); // It was called, but it failed
  });


  it('should set loading to false and show success alert if everything succeeds', async () => {
    mockUploadBytes.mockResolvedValueOnce({ snapshot: 'mock-snapshot' });
    mockGetDownloadURL.mockResolvedValueOnce('http://example.com/image.jpg');
    mockAddDoc.mockResolvedValueOnce({ id: 'doc123' }); // Simulate successful doc creation

    const { getByText, getByPlaceholderText, getByTestId } = render(<AddPost />);

    // Simulate picking an image
    fireEvent.press(getByTestId('image-picker-touchable'));
    await waitFor(() => expect(require('expo-image-picker').launchImageLibraryAsync).toHaveBeenCalled());

    // Fill in form details
    fireEvent.changeText(getByPlaceholderText('Title'), 'Successful Post');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Successful Description');

    // Trigger form submission
    await act(async () => {
      fireEvent.press(getByText('Submit'));
    });

    // Assertions
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Successfully Donated Item.");
    });

    expect(getByText('Submit')).toBeTruthy();
    expect(mockUploadBytes).toHaveBeenCalled();
    expect(mockGetDownloadURL).toHaveBeenCalled();
    expect(mockAddDoc).toHaveBeenCalled();
  });
});
