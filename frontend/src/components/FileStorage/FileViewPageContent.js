import axios from 'axios';
import moment from 'moment';
import Modal from 'react-modal';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import classes from './FileView.Module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../style.css"
import preloader from '../../images/preloader.gif';
import downloadLoader from '../../images/download.gif';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';


const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '50%'
    },
};


function FileViewPageContentWithPagination() {

    const auth = useContext(AuthContext);
    const nav = useNavigate();

    const [files, setFiles] = useState([]);
    const [isLoading, setLoading] = useState();
    const [isDownloading, setDownloading] = useState();
    const [pageNumber, setPageNumber] = useState(0);
    const filesPerPage = 5;
    const filesVisited = pageNumber * filesPerPage;

    let subtitle;
    const [modalIsOpen, setIsOpen] = useState(false);
    const [fileIdForBlockOrUnblock, setFileIdForBlockOrUnblock] = useState();
    const [blockStatus, setBlockStatus] = useState();
    const [modalTitle, setModalTitle] = useState();
    const [userName, setUserName] = useState();
    const [fileName, setFileName] = useState();

    const displayFiles = files.slice(filesVisited, filesVisited + filesPerPage).map((file, index) => {
        return <tr key={index} data-widget="expandable-table" aria-expanded="false">
            <th scope="row">{index + 1}</th>
            <td>{file.fileName}</td>
            <td>{file.fileSize}</td>
            <td>{file.fileData.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? "Application/Document" : file.fileData.contentType}</td>
            <td>{moment(file.createdAt).format('YYYY-MM-DD hh:mm:ss')}</td>
            <td>
                <button className="btn btn-outline-primary m-lg-1" onClick={() => downloadFile(file.fileName, JSON.stringify(file._id).replace("+", ""))}>
                    <FontAwesomeIcon icon="fa fa-download" />
                </button>
            </td>
            {auth.token &&
                <td>
                    {file.blockStatus === true &&
                        <button className="btn btn-outline-success m-lg-1" onClick={() => openModal(file._id, file.fileName, auth.userID, auth.userName, false)}>
                            <FontAwesomeIcon icon="fa fa-unlock" />
                            <span> UnBlock</span>
                        </button>

                    }

                    {file.blockStatus === false &&
                        <button className="btn btn-outline-danger m-lg-1" onClick={() => openModal(file._id, file.fileName, auth.userID, auth.userName, true)}>
                            <FontAwesomeIcon icon="fa fa-ban" />
                            <span> Block</span>
                        </button>
                    }
                </td>
            }
        </tr>
    });
    const pageCount = Math.ceil(files.length / filesPerPage);
    const changePage = ({ selected }) => {
        setPageNumber(selected);
    };

    useEffect(() => {
        setLoading(true);
        loadFiles();

    }, []);

    // load all the files
    //const Authtoken = "Bearer " + auth.token;
    const loadFiles = async () => {
        await axios
            .get("http://localhost:5000/file/view-files", {
                "headers": {
                    "authorization": auth.token
                }
            })
            .then((response) => {
                console.log(response);
                setTimeout(function () {
                    setFiles(response.data.reverse());
                    setLoading(false);
                }, 500)
            });

    }

    const downloadFile = async (fileName, fileId) => {
        const final_id = JSON.parse(fileId);
        setDownloading(true);
        axios({
            url: "http://localhost:5000/file/download-file", //your url
            method: 'POST',
            responseType: 'blob', // important
            data: {
                fileId: final_id,
                userId: auth.userID
            }
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
        }).catch((error) => {
            alert("File can not be downloaded for block status code 210");
            window.location.reload();

        })
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

    const openModal = (fileId, fileName, userId, userName, blockStatus) => {
        setIsOpen(true);
        setFileIdForBlockOrUnblock(fileId);
        setBlockStatus(blockStatus);
        setUserName(userName);
        setFileName(fileName);

        if (blockStatus === true) {
            setModalTitle("Blocking");
        } else {
            setModalTitle("Unblocking")
        }
    };

    const afterOpenModal = () => {
        subtitle.style.color = '#f00';
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    const handleModalSubmission = async (event) => {
        event.preventDefault();
        console.log("userId :: " + event.target.userId.value + " :: fileId :: "
            + event.target.fileId.value + " :: blockStatus :: " + event.target.blockStatus.value
            + " :: reason :: " + event.target.reason.value)

        let userId = event.target.userId.value;
        let userName = event.target.userName.value;
        let fileId = event.target.fileId.value;
        let fiileName = event.target.fileName.value;
        let blockStatus = event.target.blockStatus.value;
        let reason = event.target.reason.value;

        await axios({
            method: 'post',
            url: "http://localhost:5000/admin/send-request-admin-file-block-unblock",
            data: {
                userId: userId,
                userName: userName,
                fileId: fileId,
                fileName: fileName,
                blockStatus: blockStatus,
                reason: reason
            }
        }).then((response) => {
            console.log(response.data);
            alert("Status Code - " + response.status + " . " + response.data);
            closeModal();
            nav("/view-files")
        });


    }

    return (
        <Fragment>

            <section class="content">
                <div class="container-fluid">

                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">File List</h3>

                                </div>

                                <div class="card-body table-responsive p-0">
                                    <table class="table table-hover text-nowrap">
                                        <thead>
                                            <tr>
                                                <th >#</th>
                                                <th >File Name</th>
                                                <th >File Size (MB)</th>
                                                <th >Content Type</th>
                                                {/* <th scope="col">Content Type</th> */}
                                                <th >Created At</th>
                                                <th >Download</th>
                                                {auth.token &&
                                                    <th >Request(Block | unblock)</th>
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                displayFiles
                                            }
                                        </tbody>

                                    </table>

                                </div>
                                <div class="card-footer clearfix">
                                    <ul class="pagination pagination-sm m-0 float-right">

                                        <ReactPaginate
                                            previousLabel={"<<"}
                                            nextLabel={">>"}
                                            pageCount={pageCount}
                                            onPageChange={changePage}
                                            containerClassName={"pagination pagination-sm m-0 float-right"}
                                            pageClassName={"page-item"}
                                            pageLinkClassName={"page-link"}
                                            previousClassName={"page-item"}
                                            previousLinkClassName={"page-link"}
                                            nextClassName={"page-item"}
                                            nextLinkClassName={"page-link"}
                                            disabledClassName={"paginationDisabled"}
                                            activeClassName={"paginationActive"}
                                        />
                                    </ul>

                                </div>

                            </div>

                        </div>
                    </div>
                    <div class="row">

                        <Modal
                            isOpen={modalIsOpen}
                            onAfterOpen={afterOpenModal}
                            onRequestClose={closeModal}
                            style={customStyles}
                            contentLabel="Example Modal"
                            ariaHideApp={false}
                        >
                            <button className="float-end" onClick={closeModal}><FontAwesomeIcon icon='fa fa-window-close ' /></button>
                            <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Request for {modalTitle} File</h2>
                            <form onSubmit={handleModalSubmission}>
                                <input type="hidden" class="form-control" name="userId" value={auth.userID} /><br />
                                <input type="hidden" class="form-control" name="userName" value={auth.userName} /> <br />
                                <input type="hidden" class="form-control" name="fileId" value={fileIdForBlockOrUnblock} /> <br />
                                <input type="hidden" class="form-control" name="fileName" value={fileName} /> <br />
                                <input type="hidden" class="form-control" name="blockStatus" value={blockStatus} /> <br />
                                <textarea type="text" class="form-control" name="reason"></textarea> <br />
                                <button className='btn btn-primary'>Send Request</button>
                            </form>
                        </Modal>

                    </div>

                </div>
            </section>
        </Fragment>
    )

}

export default FileViewPageContentWithPagination