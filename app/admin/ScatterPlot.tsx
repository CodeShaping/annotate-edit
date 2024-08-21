import React from 'react';
import { Scatter } from 'react-chartjs-2';
import 'chart.js/auto';
import { LogEvent, LogType } from '../page';
const logTypes = [
    'edit',
    'exit-edit',
    'compile',
    'compiled-result',
    'compiled-error',
    'generate-param',
    'generate-code',
    'generate-error',
    'switch-task',
    'end-interpretation',
    'brush',
    'commit-change',
    'remove-shape',
    'edit-interpretation',
    'start-interpretation',
    'accept-changes',
    'reject-changes'
];

const ScatterPlot = ({ logs }: { logs: LogEvent[] }) => {

    const logTypeToNumeric: { [key: string]: number } = {};
    const numericToLogType: (string | null)[] = [null]; // 0 index is not used

    logTypes.forEach((logType, index) => {
        const numericValue = index + 1;
        logTypeToNumeric[logType] = numericValue;
        numericToLogType[numericValue] = logType;
    });

    const mapLogTypeToNumeric = (logType: LogType) => {
        return (logTypeToNumeric[logType] as any) || 0;
    };

    const mapNumericToLogType = (numericValue: number) => {
        return numericToLogType[numericValue] || null;
    };

    const toHumanReadableDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    }

    const data = {
        datasets: [{
            label: 'Log Scatter Plot',
            data: logs.map(log => ({
                x: log.timestamp,
                y: mapLogTypeToNumeric(log.type),
            })),
            backgroundColor: 'rgba(255, 99, 132, 1)',
        }],
    };

    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Timestamp',
                },
                ticks: {
                    callback: function (value: number) {
                        return toHumanReadableDate(value);
                    },
                    maxRotation: 45, // Rotate x-axis ticks by 45 degrees
                    minRotation: 45,
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Log Type',
                },
                ticks: {
                    callback: function (value: number) {
                        return mapNumericToLogType(value);
                    },
                    // Adjust the stepSize or autoSkip to condense the gap between y-axis ticks
                    autoSkip: true,
                    autoSkipPadding: 30, // Increase or adjust as needed to condense
                    maxTicksLimit: 100, // Adjust this value to control the maximum number of ticks displayed
                }
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        // Customize tooltip. This is just an example
                        return `Log Type: ${mapNumericToLogType(context.parsed.y)}\nTimestamp: ${toHumanReadableDate(context.raw.x)}
                        `;
                    }
                }
            }
        }
    } as any;

    return <Scatter
        data={data}
        options={options}
    />;
};

export default ScatterPlot;