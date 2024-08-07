'use client'

import { getAllDataFromCollection } from "../lib/firebase";
import { userStudyTasks } from "../lib/tasks";
import { useState, useEffect, useRef } from "react";
import { type DocumentData } from "firebase/firestore";
import { LogEvent, LogType } from '../page';
import Image from 'next/image';
import ScatterPlot from "./ScatterPlot";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';



export default function Admin() {
    const [logs, setLogs] = useState<LogEvent[]>([]);
    const [filteredLogs, setFilteredLogs] = useState(logs);
    const userId = useRef<string | null>(null);
    // const selectedTaskId = useRef<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [expandedCell, setExpandedCell] = useState(null) as any;
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        const url = new URL(window.location.href);
        const urlParams = new URLSearchParams(window.location.search);
        const userIdFromUrl = urlParams.get('userId');
        if (userIdFromUrl) {
            userId.current = userIdFromUrl;
        }


        getAllDataFromCollection(`${userId.current}_${selectedTaskId}`).then((data) => {
            setLogs(data as LogEvent[]);
        });
    }, []);

    const handleTaskIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const taskId = e.target.value;
        if (!userId.current) return;
        setSelectedTaskId(taskId);

        console.log('taskId', taskId, userId.current);
        getAllDataFromCollection(`${userId.current}_${taskId}`).then((data) => {
            // sort by timestamp
            setLogs(data.sort((a: any, b: any) => a.timestamp - b.timestamp) as LogEvent[]);
            setFilteredLogs(data.sort((a: any, b: any) => a.timestamp - b.timestamp) as LogEvent[]);
        });
    };

    const renderLogData = (log: any) => {
        // if log type is an object then stringify it
        log.data = typeof log.data === 'object' ? JSON.stringify(log.data) : log.data;
        if (log.type === 'generate-param' || log.type === 'start-interpretation') {
            return <Image
                src={log.data}
                alt="Generated"
                width={200}
                height={200}
                onClick={() => showFullImage(log.data)}
            />;
        } else if (log.type === 'generate-code') {
            return <pre>
                <code className="language-javascript">
                    {log.data.slice(0, 100)}
                </code>
            </pre>
        } else {
            return <p>{log.data}</p>
        }
    }

    const showFullImage = (base64Data: string) => {
        const imageWindow = window.open('');
        if (imageWindow) {
            imageWindow.document.write(`<img src="${base64Data}" alt="Generated Image" style="max-width:100%; height:auto;">`);
        }
    };

    const toggleExpand = (index: number) => {
        if (expandedCell === index) {
            setExpandedCell(null); // Collapse if it's already expanded
        } else {
            setExpandedCell(index); // Expand the clicked one
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    // const fetchLogsAndExportCSV = async () => {
    //     let allLogs = []
    //     for (const task of userStudyTasks) {
    //         const logs = await getAllDataFromCollection(`${userId.current}_${task.id}`);
    //         console.log(`Logs for task ${task.id}`, logs.length);
    //         allLogs.push(...logs);
    //     }

    //     let csvContent = "data:text/csv;charset=utf-8,";
    //     csvContent += "\"UserId\",\"TaskId\",\"LogType\",\"Data\",\"Timestamp\"\n";

    //     allLogs.forEach(log => {
    //         const dataString = JSON.stringify(log.data)
    //             .replace(/"/g, '""'); // Escape double quotes
    //         const row = `"${log.userId}","${log.taskId}","${log.type}","${dataString}","${log.timestamp}"\n`;
    //         csvContent += row;
    //     });

    //     const encodedUri = encodeURI(csvContent);
    //     const link = document.createElement("a");
    //     link.setAttribute("href", encodedUri);
    //     link.setAttribute("download", `logs-${userId.current}.csv`);
    //     document.body.appendChild(link);

    //     link.click();
    //     document.body.removeChild(link);
    // };


    const fetchLogsAndExportCSV = async () => {
        let allLogs = [];
        const zip = new JSZip();
        const imgFolder = zip.folder("images");

        for (const task of userStudyTasks) {
            const logs = await getAllDataFromCollection(`${userId.current}_${task.id}`);
            // console.log(`Logs for task ${task.id}`, logs.length);
            allLogs.push(...logs);

            // Assuming log.data contains the image URL or base64 string
            logs.forEach((log, index) => {
                if (log.data && log.data.startsWith("data:image")) { // Check if log.data is a base64 image
                    const base64Data = log.data.split(',')[1]; // Get the base64 part
                    const fileName = `${userId.current}_${task.id}_${index}.png`; // Assuming PNG format
                    imgFolder?.file(fileName, base64Data, { base64: true });
                }
            });
        }

        // Add CSV file to ZIP
        // Add CSV file to ZIP
        let csvContent = "\"UserId\",\"TaskId\",\"LogType\",\"Data\",\"Timestamp\"\n";
        allLogs.forEach(log => {
            let dataString;
            // Check if log.data is an image (simple check for URLs or base64-encoded images)
            if (typeof log.data === 'string' && (log.data.startsWith('http') || log.data.startsWith('data:image'))) {
                // It's an image, use null for the image data
                dataString = "null";
            } else {
                dataString = JSON.stringify(log.data).replace(/"/g, '""'); // Escape double quotes
            }

            const row = `"${log.userId}","${log.taskId}","${log.type}","${dataString}","${log.timestamp}"\n`;
            csvContent += row;
        });
        zip.file(`logs-${userId.current}.csv`, csvContent);

        // Generate ZIP file and trigger download
        zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, `logs-images-${userId.current}.zip`);
        });
    };

    return (
        <div>
            <h2>Logs</h2>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                }}>
                <label htmlFor="taskIdSelect">Select Task ID:</label>
                <select
                    onChange={handleTaskIdChange}
                    value={selectedTaskId}
                    className='taskSelector'
                >
                    <option value="" disabled>Select a task</option>
                    {userStudyTasks.map(task => (
                        <option key={task.id} value={task.id}>
                            {task.title} - {task.description}
                        </option>
                    ))}
                </select>
                <div>
                    <label htmlFor="filterType">Filter Type</label>
                    <input
                        type="text"
                        id="filterType"
                        value={filterText}
                        onChange={(e) => {
                            setFilterText(e.target.value);
                            setFilteredLogs(logs.filter(log => log.type.includes(e.target.value)));
                        }}
                    />
                </div>
                <button
                    style={{ marginLeft: '1rem', padding: '0.5rem 1rem', border: '1px solid rgb(77, 171, 247)', borderRadius: '4px', backgroundColor: 'white', color: 'rgb(77, 171, 247)', cursor: 'pointer' }}
                    onClick={fetchLogsAndExportCSV}>Export to CSV</button>
            </div>

            {/* Data Viz */}
            {logs.length > 0 && <ScatterPlot logs={logs} />}

            {/* Log Table */}
            <table className="logs-table">
                <thead>
                    <tr>
                        <th>Task ID</th>
                        <th>Log Type</th>
                        <th>Data</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLogs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.taskId}</td>
                            <td>{log.type}</td>
                            <td>
                                {renderLogData(log)}
                            </td>
                            <td>{formatDate(log.timestamp)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
};
