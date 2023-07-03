import { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";

import { userActions } from "_store";

export { Audit };

function Audit() {
    const users = useSelector((x) => x.users.list);
    const auth = useSelector(x => x.auth.value);

    const isAuditDisable = !(auth?.role === 'Auditor');

    const dispatch = useDispatch();

    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [is24HourFormat, setIs24HourFormat] = useState(false);

    const searchFilterKeys = ['firstName', 'lastName', 'username'];
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(userActions.getAll());
    }, []);

    const handleSort = (key) => {
        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({ key, direction });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleTimeFormatChange = () => {
        setIs24HourFormat(!is24HourFormat);
    };

    const sortedUsers = users?.value
        ? [...users?.value]?.sort((a, b) => {
            if (!b[sortConfig.key] || !a[sortConfig.key]) return 0;
            if (sortConfig.direction === "desc") {
                return b[sortConfig.key].localeCompare(a[sortConfig.key]);
            } else {
                return a[sortConfig.key].localeCompare(b[sortConfig.key]);
            }
        })
        : [];

    const filteredUsers = sortedUsers.filter((user) => {
        return searchFilterKeys.map((searchKey) => 
            user[searchKey].toLowerCase().includes(searchQuery.toLowerCase())
        ).some(e => e)
    }
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleClickFirst = () => {
        setCurrentPage(1);
    };

    const handleClickPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleClickNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleClickLast = () => {
        setCurrentPage(totalPages);
    };

    const getPageNumbersToRender = () => {
        const pageNumbersToRender = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            pageNumbersToRender.push(...pageNumbers);
        } else {
            let startPage, endPage;

            if (currentPage <= Math.floor(maxVisiblePages / 2)) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - Math.floor(maxVisiblePages / 2);
                endPage = currentPage + Math.floor(maxVisiblePages / 2);
            }

            pageNumbersToRender.push(1);
            pageNumbersToRender.push("...");

            for (let i = startPage + 1; i <= endPage - 1; i++) {
                pageNumbersToRender.push(i);
            }

            pageNumbersToRender.push("...");
            pageNumbersToRender.push(totalPages);
        }

        return pageNumbersToRender;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const formatDateTime = (dateTime) => {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: is24HourFormat ? '2-digit' : 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: !is24HourFormat,
        };
        return new Intl.DateTimeFormat('en', options).format(new Date(dateTime));
    };

    return (
        <>{isAuditDisable ?
            <NavLink to="/" className="nav-item nav-link">Home</NavLink>
            :
            <div>
                <h1>Auditor Page</h1>
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="timeFormatDropdown">Time Format:</label>
                    <select
                        id="timeFormatDropdown"
                        className="form-select"
                        value={is24HourFormat ? '24' : '12'}
                        onChange={handleTimeFormatChange}
                    >
                        <option value="12">12-hour</option>
                        <option value="24">24-hour</option>
                    </select>
                </div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th
                                style={{ width: "20%" }}
                                onClick={() => handleSort("firstName")}
                            >
                                First Name{" "}
                                {sortConfig.key === "firstName" && (
                                    <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                                )}
                            </th>
                            <th style={{ width: "20%" }} onClick={() => handleSort("lastName")}>
                                Last Name{" "}
                                {sortConfig.key === "lastName" && (
                                    <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                                )}
                            </th>
                            <th style={{ width: "20%" }} onClick={() => handleSort("username")}>
                                Username{" "}
                                {sortConfig.key === "username" && (
                                    <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                                )}
                            </th>
                            <th style={{ width: "20%" }}><button
                                className="btn"
                                onClick={() => handleSort('createdDate')}
                            >
                                Created Date
                            </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems?.map((user) => (
                            <tr key={user.id}>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.username}</td>
                                <td>{formatDateTime(user.createdDate)}</td>
                            </tr>
                        ))}
                        {users?.loading && (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    <span className="spinner-border spinner-border-lg align-center"></span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={handleClickFirst}>
                                {"<<"}
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={handleClickPrevious}>
                                {"<"}
                            </button>
                        </li>
                        {getPageNumbersToRender().map((number, index) => (
                            <li
                                key={index}
                                className={`page-item ${currentPage === number ? "active" : ""}`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() =>
                                        typeof number === "number" ? setCurrentPage(number) : null
                                    }
                                >
                                    {number}
                                </button>
                            </li>
                        ))}
                        <li
                            className={`page-item ${currentPage === totalPages ? "disabled" : ""
                                }`}
                        >
                            <button className="page-link" onClick={handleClickNext}>
                                {">"}
                            </button>
                        </li>
                        <li
                            className={`page-item ${currentPage === totalPages ? "disabled" : ""
                                }`}
                        >
                            <button className="page-link" onClick={handleClickLast}>
                                {">>"}
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        }</>

    );
}
