import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
import { createMock, getMock } from 'storybook-addon-module-mock';
import DocumentDownloadPanel from '@presentation/components/DownloadDocuments/DocumentDownloadPanel';
import { mockUploadedDocuments } from '@tests/mockData';
import * as actual from '@presentation/components/DownloadDocuments/useDocDownload';

createMock({
    module: '@presentation/hooks/useFetchUploadedDocuments',
    export: 'useFetchUploadedDocuments',
    mock: () => ({
        data: mockUploadedDocuments,
    }),
});

createMock({
    module: '@presentation/components/DownloadDocuments/useDocDownload',
    export: 'useDocDownload',
    mock: () => ({
        handleDownload: fn(),
        loading: false,
    }),
});

const meta = {
    title: 'Components/DocumentDownloadPanel',
    component: DocumentDownloadPanel,
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof DocumentDownloadPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingState: Story = {
    args: {
        userConfig: null,
        previousStage: null,
        goBackToStage: () => {}, // stub function
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Loading application details...')).toBeInTheDocument();
        const downloadButton = canvas.getByRole('button', { name: 'Download Planning Portal Pack' });
        await expect(downloadButton).toBeDisabled();
    },
};

export const WithValidUserConfig: Story = {
    args: {
        userConfig: null,
        previousStage: null,
        goBackToStage: () => {}, // stub function
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Check for application details
        await expect(canvas.getByText('Download Documents')).toBeInTheDocument();
        await expect(
            canvas.getByText(
                'Your documents have been successfully checked and validated. You may now download them by using the button below, and upload them into the NSW Planning Portal for submission.'
            )
        ).toBeInTheDocument();

        // Check for the download button
        const downloadButton = canvas.getByRole('button', { name: 'Download Planning Portal Pack' });
        await expect(downloadButton).toBeDisabled();

        // Simulate checking the "I accept file renames" checkbox
        const checkbox = canvas.getByRole('checkbox', { name: 'I accept file renames' });
        await userEvent.click(checkbox);
        await expect(checkbox).toBeChecked();
        await expect(downloadButton).toBeEnabled();
    },
};

export const DownloadButtonClick: Story = {
    parameters: {
        moduleMock: {
            mock: () => {
                const useDocDownload = actual.useDocDownload;

                const mockUseDocDownload = createMock(actual, "useDocDownload");
                mockUseDocDownload.mockImplementation(useDocDownload);

                return [mockUseDocDownload];
            },
        },
    },
    args: {
        userConfig: null,
        previousStage: null,
        goBackToStage: () => {}, // stub function
    },
    play: async ({ canvasElement, parameters }) => {
        const mockUseDocDownload = getMock(parameters, actual, 'useDocDownload');
        const mockHandleDownload = fn();
        mockUseDocDownload.mockImplementation(() => ({
            handleDownload: mockHandleDownload,
            loading: false,
        }));

        const canvas = within(canvasElement);

        // Simulate checking the "I accept file renames" checkbox
        const checkbox = canvas.getByRole('checkbox', { name: 'I accept file renames' });
        await userEvent.click(checkbox);
        await expect(checkbox).toBeChecked();

        // Simulate clicking the download button
        const downloadButton = canvas.getByRole('button', { name: 'Download Planning Portal Pack' });
        await userEvent.click(downloadButton);

        // Verify the mock function was called

        await expect(mockHandleDownload).toHaveBeenCalledTimes(1);
    },
};