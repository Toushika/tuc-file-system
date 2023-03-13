import axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import classes from './FileView.Module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../style.css"
import preloader from '../../images/preloader.gif';
import downloadLoader from '../../images/download.gif';
import { AuthContext } from '../../context/AuthContext';


const ViewOwnFiles = () => {
    const auth = useContext(AuthContext);

    console.log("View Own files:: " + auth.token);

    const [files, setFiles] = useState([]);
    const [isLoading, setLoading] = useState();
    const [isDownloading, setDownloading] = useState();

    useEffect(() => {
        setLoading(true);
        loadFiles();

    }, []);

    // load all the files
    const Authtoken = "Bearer " + auth.token;
    const loadFiles = async () => {
        await axios({
            method: 'post',
            url: "http://localhost:5000/file/view-my-files",
            data: {
                userId: auth.userID, // This is the body part
            },
            "headers": {
                "authorization": Authtoken
            }
        }).then((response) => {
            console.log(response);
            setTimeout(function () {
                setFiles(response.data.reverse());
                setLoading(false);
            }, 500)
        });

    }

    const downloadFile = async (fileName, pId) => {
        const final_id = JSON.parse(pId);
        setDownloading(true);
        await axios({
            url: `http://localhost:5000/file/download-file/${final_id}`, //your url
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); //or any other extension
            document.body.appendChild(link);
            link.click();
            setTimeout(function () {
                setDownloading(false);
            }, 500)
        });

    }

    const deleteFile = async (fileId) => {
        const final_id = JSON.parse(fileId);
        await axios({
            method: 'post',
            url: "http://localhost:5000/file/delete-file",
            data: {
                fileId: final_id,// This is the body part
            }
        }).then((response) => {
            alert("Status Code - " + response.status + " . " + response.data);
            setTimeout(function () {
                setFiles(response.data.reverse());
            }, 500)
        });
        window.location.reload();

    }

    if (isLoading) {
        return (
            <img className='centered' src={preloader} />
        )
    }

    if (isDownloading) {
        return (
            <>
                <div className='centered' >
                    <img src={downloadLoader} />
                    <h6>Download in progress ...</h6>
                </div>
            </>
        )
    }


    return (
        <div className="main-content">
            <div className="container-fluid mt-2">
                <div className="col">
                    <div className="card shadow">
                        <div className="card-header border-0">
                            <h3 className="mb-0">List of Files</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-items-center table-flush">
                                <thead className="thead-light">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">File Name</th>
                                        <th scope="col">File Size (MB)</th>
                                        <th scope="col">Content Type</th>
                                        <th scope="col">Created At</th>
                                        <th scope="col">Download</th>
                                        <th scope="col">Delete</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        files.map((file, index) => {

                                            return <tr key={index}>
                                                <th scope="row">{index + 1}</th>
                                                <td>{file.fileName}</td>
                                                <td>{file.fileSize}</td>
                                                <td>{file.fileData.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? "Application/Document" : file.fileData.contentType}</td>
                                                <td>{moment(file.createdAt).format('YYYY-MM-DD hh:mm:ss')}</td>
                                                <td>
                                                    <button className="btn btn-outline-success m-lg-1" onClick={() => downloadFile(file.fileName, JSON.stringify(file._id).replace("+", ""))}>
                                                        <FontAwesomeIcon icon="fa fa-download" />
                                                    </button>
                                                </td>
                                                <td>
                                                    <button className="btn btn-outline-danger m-lg-1" onClick={() => deleteFile(JSON.stringify(file._id).replace("+", ""))}>
                                                        <FontAwesomeIcon icon="fa fa-trash" />
                                                    </button>
                                                </td>
                                            </tr>
                                        })
                                    }
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewOwnFiles