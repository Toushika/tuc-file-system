import axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../style.css"
import preloader from '../../images/preloader.gif';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import progressLoader from '../../images/download.gif';

const ViewRequestByUserContent = () => {
    const auth = useContext(AuthContext);
    const nav = useNavigate();

    const [userRequests, setUserRequests] = useState([]);
    const [isLoading, setLoading] = useState();
    const [isProgressing, setProgressing] = useState();
    const [pageNumber, setPageNumber] = useState(0);
    const filesPerPage = 2;
    const filesVisited = pageNumber * filesPerPage;

    useEffect(() => {
        setLoading(true);
        loadFiles();

    }, []);

    // load all the files
    const loadFiles = async () => {
        await axios
            .get("http://localhost:5000/admin/view-requests/")
            .then((response) => {
                setTimeout(function () {
                    setUserRequests(response.data.reverse());
                    setLoading(false);
                }, 500)
            });

    }

    const approveBlock = (fileId, userId, blockStatus, reason, id) => {
        setProgressing(true);
        axios({
            url: "http://localhost:5000/admin/process-to-get-sha256-hash-file/", //your url
            method: 'POST',
            data: {
                fileId: fileId
            }
        }).then((response) => {
            console.log(response.data);
            axios({
                method: 'post',
                url: "http://localhost:5000/admin/approve-block-request",
                data: {
                    id: id,
                    fileId: fileId,
                    userId: userId,
                    blockStatus: blockStatus,
                    reason: reason,
                    fileHashedValue: response.data
                }
            }).then((finalResponse) => {
                console.log(finalResponse.data);
                alert("Status Code - " + finalResponse.status + " . " + finalResponse.data);
                setProgressing(false);
                window.location.reload();
            });
        });
    }

    const approveUnblock = (fileId, userId, blockStatus, reason, id) => {
        setProgressing(true);
        axios({
            url: "http://localhost:5000/admin/process-to-get-sha256-hash-file/", //your url
            method: 'POST',
            data: {
                fileId: fileId
            }
        }).then((response) => {
            console.log(response.data);
            axios({
                method: 'post',
                url: "http://localhost:5000/admin/approve-unblock-request",
                data: {
                    id: id,
                    fileId: fileId,
                    userId: userId,
                    blockStatus: blockStatus,
                    reason: reason,
                    fileHashedValue: response.data
                }
            }).then((finalResponse) => {
                console.log(finalResponse.data);
                alert("Status Code - " + finalResponse.status + " . " + "File has been Unblocked and saved in DB.");
                setProgressing(false);
                window.location.reload();
            });
        });

    }

    const rejectRequest = async (requestId) => {
        var final_request_id = JSON.parse(requestId);
        await axios({
            method: 'post',
            url: "http://localhost:5000/admin/reject-request",
            data: {
                requestId: final_request_id,
            }
        }).then((response) => {
            alert("Status Code - " + response.status + " . " + response.data);
            window.location.reload();
        });

    }

    if (isLoading) {
        return (
            <img className='centered' src={preloader} />
        )
    }

    if (isProgressing) {
        return (
            <>
                <div className='centered' >
                    <img src={progressLoader} />
                    <h6>progressing ...</h6>
                </div>
            </>
        )
    }
    //userRequests.map((userRequest, index) 
    const displayFiles = userRequests.slice(filesVisited, filesVisited + filesPerPage).map((userRequest, index) => {
        return <tr key={index}>
            <th scope="row">{index + 1}</th>
            <td>{userRequest.fileName}</td>
            <td>{userRequest.userName}</td>
            <td>{userRequest.reason}</td>
            <td>{moment(userRequest.createdAt).format('YYYY-MM-DD hh:mm:ss')}</td>
            {JSON.stringify(userRequest.blockStatus) === "true" &&
                <td>
                    <button className="btn btn-outline-danger m-lg-1" onClick={() => approveBlock(userRequest.fileId, userRequest.userId, userRequest.blockStatus, userRequest.reason, userRequest._id)}>
                        <FontAwesomeIcon icon="fa fa-ban" />
                        <span> Approve Block</span>
                    </button>
                    <button className="btn btn-outline-info  m-lg-1" onClick={() => rejectRequest(JSON.stringify(userRequest._id).replace("+", ""))}>
                        <FontAwesomeIcon icon="fa fa-close" />
                        <span> Reject</span>
                    </button>
                </td>

            }
            {JSON.stringify(userRequest.blockStatus) === "false" &&
                <td>
                    <button className="btn btn-outline-success m-lg-1" onClick={() => approveUnblock(userRequest.fileId, userRequest.userId, userRequest.blockStatus, userRequest.reason, userRequest._id)}>
                        <FontAwesomeIcon icon="fa fa-unlock" />
                        <span> Approve Unblock</span>
                    </button>

                    <button className="btn btn-outline-info  m-lg-1" onClick={() => rejectRequest(JSON.stringify(userRequest._id).replace("+", ""))} >
                        <FontAwesomeIcon icon="fa fa-close" />
                        <span> Reject</span>
                    </button>
                </td>
            }

        </tr>
    });
    const pageCount = Math.ceil(userRequests.length / filesPerPage);
    const changePage = ({ selected }) => {
        setPageNumber(selected);
    };

    return (
        <div className="main-content">
            <div className="container-fluid mt-2">
                <div className="col">
                    <div className="card shadow">
                        <div className="card-header border-0">
                            <h3 className="mb-0">List of Requests</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-items-center table-flush">
                                <thead className="thead-light">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">File Name</th>
                                        <th scope="col">Requested User</th>
                                        <th scope="col">Reason</th>
                                        <th scope="col">Request created At</th>
                                        <th scope="col">Action (Block | unblock | Reject)</th>
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
        </div>
    )
}

export default ViewRequestByUserContent;