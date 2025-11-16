'use client';

import React, { useState, useEffect, useMemo } from 'react';
import './BuildTimesDashboard.css';

const BuildTimesDashboard = () => {
  const [allBuilds, setAllBuilds] = useState([]);
  const [expandedBuild, setExpandedBuild] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [dateRange, setDateRange] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Mock data generator for CI pipeline builds
  const generateMockBuilds = () => {
    const branches = ['main', 'develop', 'feature/auth', 'feature/dashboard', 'hotfix/bug-123'];
    const statuses = ['success', 'failed', 'running'];
    const statusWeights = [0.7, 0.2, 0.1];

    const mockBuilds = Array.from({ length: 50 }, (_, i) => {
      const rand = Math.random();
      let status = statuses[0];
      if (rand > statusWeights[0] && rand <= statusWeights[0] + statusWeights[1]) {
        status = statuses[1];
      } else if (rand > statusWeights[0] + statusWeights[1]) {
        status = statuses[2];
      }

      const buildTime = status === 'running'
        ? null
        : Math.floor(Math.random() * 600) + 120;

      const timestamp = new Date(Date.now() - i * 3600000);
      const branch = branches[Math.floor(Math.random() * branches.length)];

      return {
        id: `build-${1050 - i}`,
        branch,
        commit: Math.random().toString(36).substring(2, 9),
        status,
        buildTime,
        timestamp,
        triggeredBy: ['alice', 'bob', 'charlie', 'CI'][Math.floor(Math.random() * 4)],
        tests: {
          passed: status === 'success' ? Math.floor(Math.random() * 50) + 150 : Math.floor(Math.random() * 150),
          failed: status === 'failed' ? Math.floor(Math.random() * 10) + 1 : 0,
          skipped: Math.floor(Math.random() * 5)
        },
        stages: [
          { name: 'Checkout', duration: Math.floor(Math.random() * 10) + 5, status: 'success' },
          { name: 'Install Dependencies', duration: Math.floor(Math.random() * 60) + 30, status: status === 'failed' && Math.random() > 0.5 ? 'failed' : 'success' },
          { name: 'Build', duration: Math.floor(Math.random() * 120) + 60, status: status === 'failed' && Math.random() > 0.3 ? 'failed' : 'success' },
          { name: 'Test', duration: Math.floor(Math.random() * 180) + 60, status: status === 'failed' ? 'failed' : 'success' },
          { name: 'Deploy', duration: Math.floor(Math.random() * 30) + 10, status: status === 'running' ? 'running' : status }
        ],
        message: `${['feat', 'fix', 'chore', 'refactor'][Math.floor(Math.random() * 4)]}: ${['update dependencies', 'fix login bug', 'improve performance', 'add new feature'][Math.floor(Math.random() * 4)]}`
      };
    });

    return mockBuilds;
  };

  useEffect(() => {
    const mockBuilds = generateMockBuilds();
    setAllBuilds(mockBuilds);
  }, []);

  // Get unique branches for filter
  const uniqueBranches = useMemo(() => {
    return [...new Set(allBuilds.map(b => b.branch))];
  }, [allBuilds]);

  // Filter builds based on all criteria
  const filteredBuilds = useMemo(() => {
    let filtered = [...allBuilds];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Branch filter
    if (branchFilter !== 'all') {
      filtered = filtered.filter(b => b.branch === branchFilter);
    }

    // Date range filter
    const now = new Date();
    if (dateRange === '24h') {
      filtered = filtered.filter(b => now - b.timestamp < 24 * 3600000);
    } else if (dateRange === '7d') {
      filtered = filtered.filter(b => now - b.timestamp < 7 * 24 * 3600000);
    } else if (dateRange === '30d') {
      filtered = filtered.filter(b => now - b.timestamp < 30 * 24 * 3600000);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.commit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.triggeredBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [allBuilds, statusFilter, branchFilter, dateRange, searchTerm]);

  // Sort builds
  const sortedBuilds = useMemo(() => {
    let sorted = [...filteredBuilds];

    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'timestamp') {
        aValue = a.timestamp.getTime();
        bValue = b.timestamp.getTime();
      } else if (sortConfig.key === 'buildTime') {
        aValue = a.buildTime || 0;
        bValue = b.buildTime || 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredBuilds, sortConfig]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completedBuilds = filteredBuilds.filter(b => b.buildTime !== null);
    const successfulBuilds = completedBuilds.filter(b => b.status === 'success');
    const avgTime = completedBuilds.length > 0
      ? completedBuilds.reduce((sum, b) => sum + b.buildTime, 0) / completedBuilds.length
      : 0;

    return {
      averageBuildTime: Math.round(avgTime),
      successRate: completedBuilds.length > 0
        ? Math.round((successfulBuilds.length / completedBuilds.length) * 100)
        : 0,
      totalBuilds: filteredBuilds.length,
      failedBuilds: filteredBuilds.filter(b => b.status === 'failed').length
    };
  }, [filteredBuilds]);

  // Chart data for build times
  const chartData = useMemo(() => {
    return sortedBuilds.slice(0, 20).reverse().filter(b => b.buildTime !== null);
  }, [sortedBuilds]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleBuildExpansion = (buildId) => {
    setExpandedBuild(expandedBuild === buildId ? null : buildId);
  };

  const formatDuration = (seconds) => {
    if (seconds === null) return 'In Progress';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'success':
        return 'status-success';
      case 'failed':
        return 'status-failed';
      case 'running':
        return 'status-running';
      default:
        return '';
    }
  };

  // Custom Dropdown Component
  const CustomDropdown = ({ id, value, options, onChange, placeholder }) => {
    const isOpen = openDropdown === id;
    const selectedOption = options.find(opt => opt.value === value);

    const toggleDropdown = () => {
      setOpenDropdown(isOpen ? null : id);
    };

    const handleSelect = (optionValue) => {
      onChange(optionValue);
      setOpenDropdown(null);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.custom-dropdown')) {
          setOpenDropdown(null);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
      <div className="custom-dropdown">
        <button
          className="dropdown-trigger"
          onClick={toggleDropdown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-label={placeholder}
        >
          <span>{selectedOption?.label || placeholder}</span>
          <span className="dropdown-arrow" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <ul className="dropdown-menu" role="listbox" id={`${id}-listbox`}>
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                className={`dropdown-item ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="build-times-dashboard">
      <header className="dashboard-header">
        <h1>CI Pipeline Build Times</h1>
        <p className="dashboard-subtitle">Monitor and track your continuous integration builds</p>
      </header>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalBuilds}</div>
            <div className="stat-label">Total Builds</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{formatDuration(stats.averageBuildTime)}</div>
            <div className="stat-label">Average Build Time</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.successRate}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.failedBuilds}</div>
            <div className="stat-label">Failed Builds</div>
          </div>
        </div>
      </div>

      {/* Build Time Chart */}
      <div className="chart-container">
        <h3>Build Duration Trend</h3>
        <div className="chart">
          {chartData.map((build, idx) => {
            const maxTime = Math.max(...chartData.map(b => b.buildTime));
            const height = (build.buildTime / maxTime) * 100;
            return (
              <div key={build.id} className="chart-bar-wrapper">
                <div
                  className={`chart-bar ${build.status === 'failed' ? 'chart-bar-failed' : ''}`}
                  style={{ height: `${height}%` }}
                  title={`${build.id}: ${formatDuration(build.buildTime)}`}
                />
                <div className="chart-label">{idx % 3 === 0 ? `#${build.id.split('-')[1]}` : ''}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search builds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <CustomDropdown
            id="status-filter"
            value={statusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'success', label: 'Success' },
              { value: 'failed', label: 'Failed' },
              { value: 'running', label: 'Running' }
            ]}
            onChange={setStatusFilter}
            placeholder="All Statuses"
          />

          <CustomDropdown
            id="branch-filter"
            value={branchFilter}
            options={[
              { value: 'all', label: 'All Branches' },
              ...uniqueBranches.map(branch => ({ value: branch, label: branch }))
            ]}
            onChange={setBranchFilter}
            placeholder="All Branches"
          />

          <CustomDropdown
            id="date-range-filter"
            value={dateRange}
            options={[
              { value: 'all', label: 'All Time' },
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' }
            ]}
            onChange={setDateRange}
            placeholder="All Time"
          />
        </div>
      </div>

      {/* Builds Table */}
      <div className="builds-table-container">
        <div className="table-header">
          <h2>Build History</h2>
          <div className="results-count">{sortedBuilds.length} results</div>
        </div>

        <table className="builds-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Expand details</span>
              </th>
              <th scope="col">
                <button onClick={() => handleSort('id')} className="sortable">
                  Build ID <span aria-hidden="true">{sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</span>
                </button>
              </th>
              <th scope="col">
                <button onClick={() => handleSort('branch')} className="sortable">
                  Branch <span aria-hidden="true">{sortConfig.key === 'branch' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</span>
                </button>
              </th>
              <th scope="col">Commit</th>
              <th scope="col">
                <button onClick={() => handleSort('status')} className="sortable">
                  Status <span aria-hidden="true">{sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</span>
                </button>
              </th>
              <th scope="col">
                <button onClick={() => handleSort('buildTime')} className="sortable">
                  Duration <span aria-hidden="true">{sortConfig.key === 'buildTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</span>
                </button>
              </th>
              <th scope="col">Triggered By</th>
              <th scope="col">
                <button onClick={() => handleSort('timestamp')} className="sortable">
                  Time <span aria-hidden="true">{sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBuilds.map((build) => (
              <React.Fragment key={build.id}>
                <tr className={expandedBuild === build.id ? 'expanded-row' : ''}>
                  <td>
                    <button
                      onClick={() => toggleBuildExpansion(build.id)}
                      className="expand-button"
                      aria-expanded={expandedBuild === build.id}
                      aria-controls={`${build.id}-details`}
                      aria-label={`${expandedBuild === build.id ? 'Collapse' : 'Expand'} details for ${build.id}`}
                    >
                      <span aria-hidden="true">{expandedBuild === build.id ? '▼' : '▶'}</span>
                    </button>
                  </td>
                  <td className="build-id">{build.id}</td>
                  <td className="branch-name">{build.branch}</td>
                  <td className="commit-hash">{build.commit}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(build.status)}`} title={build.status}>
                    </span>
                  </td>
                  <td className="build-duration">{formatDuration(build.buildTime)}</td>
                  <td>{build.triggeredBy}</td>
                  <td className="timestamp">{formatTimestamp(build.timestamp)}</td>
                </tr>
                {expandedBuild === build.id && (
                  <tr className="detail-row" id={`${build.id}-details`}>
                    <td colSpan="8">
                      <div className="build-details">
                        <div className="detail-section">
                          <h4>Commit Message</h4>
                          <p className="commit-message">{build.message}</p>
                        </div>

                        <div className="detail-section">
                          <h4>Test Results</h4>
                          <div className="test-results">
                            <span className="test-stat passed">
                              {build.tests.passed} passed
                            </span>
                            <span className="test-stat failed">
                              {build.tests.failed} failed
                            </span>
                            <span className="test-stat skipped">
                              {build.tests.skipped} skipped
                            </span>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>Pipeline Stages</h4>
                          <div className="stages">
                            {build.stages.map((stage, idx) => (
                              <div key={idx} className={`stage stage-${stage.status}`}>
                                <div className="stage-name">{stage.name}</div>
                                <div className="stage-duration">{formatDuration(stage.duration)}</div>
                                <div className={`stage-status status-${stage.status}`}>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="detail-section">
                          <div className="build-actions">
                            <div className="btn btn-primary btn-sm">View Logs</div>
                            <div className="btn btn-secondary btn-sm">Retry Build</div>
                            <div className="btn btn-secondary btn-sm">Download Artifacts</div>
                            <div className="btn btn-ghost btn-sm">Cancel</div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuildTimesDashboard;
