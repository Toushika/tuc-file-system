import React, { useContext, useState, Fragment } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from 'react-router-dom';
import classes from './FileView.Module.css'
import { AuthContext } from '../../context/AuthContext';

const FileUploadPageContent = () => {
    const auth = useContext(AuthContext);
    const [file, setFile] = useState();
    const [files, setFiles] = useState();
    const navigate = useNavigate();
    const Authtoken = "Bearer " + auth.token;

    function handleSingleFileChange(event) {

        setFile(event.target.files[0])
    }

    const handleSingleFileSubmit = async (event) => {

        event.preventDefault();
        console.log(file);


        const url = 'http://localhost:5000/file/upload-single-file';
        const formData = new FormData();

        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('userId', auth.userID);
        let fileSize = Math.floor(file.size / 1024 / 1024);

        //  console.log(fileSize);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',

            },
        };
        if (fileSize <= 10) {
            const res = await axios({
                method: 'post',
                url,
                data: formData,
                headers: {
                    "Content-Type": 'multipart/form-data',
                    'authorization': Authtoken,
                }
            }).then((response) => {
                alert("Status Code - " + response.status + " . " + file.name + " - has Uploaded successfully");
                navigate("/view-files");
            });
        } else {
            alert("File Size should be less than 10 mb")
        }

    }

    function handleMultipleFileChange(event) {
        setFiles(event.target.files)
    }

    function handleMultipleFileSubmit(event) {
        event.preventDefault();


        var formData = new FormData();
        for (const key of Object.keys(files)) {
            formData.append('files', files[key]);
        }
        formData.append('userId', auth.userID);
        axios.post("http://localhost:5000/file/upload-multiple-file", formData, {
            "headers": {
                "authorization": Authtoken
            }
        }, {
        }).then(res => {
            alert("Status Code - " + res.status + " . " + "All files have uploaded successfully")
            navigate("/view-files")
        }).catch((error) => {
            alert(error.message);
        })

    }

    return (
        <Fragment>
            <section class="content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className="main-content">
                <div className="container mt-7 card">
                    <div className="row">
                        <div className="col ">
                            <div className="card-header border-0">
                                <h2 className="mb-0">Upload Files</h2>
                            </div>
                        </div>
                    </div><div className='row'>
                        <div className='col-6 card shadow'>

                            <form onSubmit={handleSingleFileSubmit} className='m-5'>
                                <h4>Single File Upload</h4>
                                <div class="input-group mb-3">

                                    <input className="form-control" type="file" onChange={handleSingleFileChange} aria-label="File browser example" />
                                    <div class="input-group-append">
                                        <button type="submit" className='btn btn-outline-secondary importar' >Upload</button>
                                    </div>
                                </div>

                            </form>
                        </div>
                        <div className='col-6 card shadow'>
                            <form onSubmit={handleMultipleFileSubmit} className='m-5'>
                                <h4>Multiple Files Upload</h4>

                                <div class="input-group mb-3">

                                    <input className="form-control " type="file" onChange={handleMultipleFileChange} multiple />
                                    <div class="input-group-append">
                                        <button type="submit" class="btn btn-outline-secondary importar">Upload</button>
                                    </div>
                                </div>

                            </form>
                        </div>
                    </div>

                </div>

            </div>
        </Fragment>

    )
}

export default FileUploadPageContent;