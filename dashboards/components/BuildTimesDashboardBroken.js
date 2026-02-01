'use client';

import React, { useState, useEffect, useMemo } from 'react';
import './BuildTimesDashboard.css';

const BuildTimesDashboardBroken = () => {
  const [allBuilds, setAllBuilds] = useState([]);
  const [expandedBuild, setExpandedBuild] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [dateRange, setDateRange] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null);

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

  const uniqueBranches = useMemo(() => {
    return [...new Set(allBuilds.map(b => b.branch))];
  }, [allBuilds]);

  const filteredBuilds = useMemo(() => {
    let filtered = [...allBuilds];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (branchFilter !== 'all') {
      filtered = filtered.filter(b => b.branch === branchFilter);
    }

    const now = new Date();
    if (dateRange === '24h') {
      filtered = filtered.filter(b => now - b.timestamp < 24 * 3600000);
    } else if (dateRange === '7d') {
      filtered = filtered.filter(b => now - b.timestamp < 7 * 24 * 3600000);
    } else if (dateRange === '30d') {
      filtered = filtered.filter(b => now - b.timestamp < 30 * 24 * 3600000);
    }

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

  {/* Custom dropdown: no ARIA roles, not keyboard accessible */}
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
        <div
          className="dropdown-trigger"
          onClick={toggleDropdown}
        >
          <span>{selectedOption?.label || placeholder}</span>
          <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </div>
        {isOpen && (
          <div className="dropdown-menu">
            {options.map((option) => (
              <div
                key={option.value}
                className={`dropdown-item ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="build-times-dashboard">
      {/* ===== RULE: landmark-no-duplicate-banner — two banners ===== */}
      <header className="dashboard-header" role="banner">
        <h1>CI Pipeline Build Times</h1>
        <p className="dashboard-subtitle">Monitor and track your continuous integration builds</p>
      </header>
      <header role="banner" style={{ display: 'none' }}>
        <p>Duplicate banner</p>
      </header>

      {/* ===== RULE: img-alt — image missing alt ===== */}
      {/* ===== RULE: image-redundant-alt — alt contains "image" ===== */}
      <div className="stats-container">
        <div className="stat-card">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='28' font-size='28'%3E📊%3C/text%3E%3C/svg%3E" />
          <div className="stat-content">
            <div className="stat-value">{stats.totalBuilds}</div>
            <div className="stat-label">Total Builds</div>
          </div>
        </div>
        <div className="stat-card">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='28' font-size='28'%3E⏱️%3C/text%3E%3C/svg%3E" alt="image of a timer icon" />
          <div className="stat-content">
            <div className="stat-value">{formatDuration(stats.averageBuildTime)}</div>
            <div className="stat-label">Average Build Time</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value" style={{ color: stats.successRate > 80 ? '#38a169' : '#e53e3e' }}>{stats.successRate}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value" style={{ color: stats.failedBuilds > 0 ? '#e53e3e' : '#38a169' }}>{stats.failedBuilds}</div>
            <div className="stat-label">Failed Builds</div>
          </div>
        </div>
      </div>

      {/* ===== RULE: svg-img-alt — SVG with role=img but no accessible name ===== */}
      <svg role="img" width="24" height="24" style={{ position: 'absolute' }}>
        <circle cx="12" cy="12" r="10" fill="#4a5568" />
      </svg>

      {/* ===== RULE: heading-order — skip from h1 to h3 ===== */}
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

      {/* ===== RULE: label — input without label ===== */}
      {/* ===== RULE: select-name — select without label ===== */}
      {/* ===== RULE: autocomplete-valid — invalid autocomplete value ===== */}
      <div className="controls-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search builds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoComplete="nope"
          />
        </div>

        <div className="filters">
          {/* Unlabeled select */}
          <select className="search-input" style={{ maxWidth: 180 }}>
            <option>Priority</option>
            <option>High</option>
            <option>Low</option>
          </select>

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

      {/* ===== RULE: input-image-alt — image input without alt ===== */}
      {/* ===== RULE: input-button-name — input button without value ===== */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        <input type="image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect fill='%234a5568' width='24' height='24' rx='4'/%3E%3C/svg%3E" />
        <input type="button" />
      </div>

      {/* ===== RULE: aria-roles — invalid role ===== */}
      {/* ===== RULE: aria-valid-attr — misspelled aria attribute ===== */}
      {/* ===== RULE: aria-valid-attr-value — invalid aria value ===== */}
      {/* ===== RULE: aria-required-attr — role without required attributes ===== */}
      <div role="chckbox" aria-chekced="true">Notifications enabled</div>
      <div role="checkbox" aria-checked="yep">Subscribe to alerts</div>
      <div role="slider">Volume</div>

      {/* ===== RULE: tabindex — positive tabindex ===== */}
      {/* ===== RULE: focus-order-semantics — non-interactive element with tabindex=0 and no role ===== */}
      <div tabIndex="5" style={{ display: 'none' }}>Forced tab order</div>
      <span tabIndex="0">Not interactive but focusable</span>

      {/* ===== RULE: button-name — empty button ===== */}
      {/* ===== RULE: link-name — empty link ===== */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-icon"></button>
        <a href="/builds/latest"></a>
      </div>

      {/* ===== RULE: list — ul with invalid children ===== */}
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 8, marginBottom: 16 }}>
        <div>Environments:</div>
        <li>Production</li>
        <li>Staging</li>
        <li>Development</li>
      </ul>

      {/* ===== RULE: definition-list — dl with invalid children ===== */}
      {/* ===== RULE: dlitem — dt/dd outside dl ===== */}
      <dl style={{ marginBottom: 16 }}>
        <span>Build Info</span>
        <dt>Runner</dt>
        <dd>GitHub Actions</dd>
      </dl>
      <dt>Orphaned term</dt>
      <dd>Orphaned description</dd>

      {/* ===== RULE: duplicate-id — same id on multiple elements ===== */}
      {/* ===== RULE: duplicate-id-aria — duplicate id referenced by aria ===== */}
      <div id="build-info">Primary build info</div>
      <div id="build-info">Duplicate build info</div>
      <div aria-labelledby="build-info">Labeled by duplicate ID</div>

      {/* ===== RULE: video-caption — video without captions ===== */}
      <video width="320" height="180" style={{ marginBottom: 24, borderRadius: 8, background: '#000' }}>
        <source src="build-recording.mp4" type="video/mp4" />
      </video>

      {/* ===== RULE: td-headers-attr — cell referencing invalid header id ===== */}
      {/* ===== RULE: th-has-data-cells — header with no data cells ===== */}
      <div className="builds-table-container">
        <div className="table-header">
          <h2>Build History</h2>
          <div className="results-count">{sortedBuilds.length} results</div>
        </div>

        <table className="builds-table">
          <thead>
            <tr>
              <th></th>
              <th onClick={() => handleSort('id')} className="sortable">
                Build ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('branch')} className="sortable">
                Branch {sortConfig.key === 'branch' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Commit</th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('buildTime')} className="sortable">
                Duration {sortConfig.key === 'buildTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Triggered By</th>
              <th onClick={() => handleSort('timestamp')} className="sortable">
                Time {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              {/* th-has-data-cells: header column with no corresponding data */}
              <th id="notes-col">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sortedBuilds.map((build) => (
              <React.Fragment key={build.id}>
                <tr className={expandedBuild === build.id ? 'expanded-row' : ''}>
                  <td>
                    <div
                      onClick={() => toggleBuildExpansion(build.id)}
                      className="expand-button"
                    >
                      {expandedBuild === build.id ? '▼' : '▶'}
                    </div>
                  </td>
                  <td className="build-id">{build.id}</td>
                  <td className="branch-name">{build.branch}</td>
                  <td className="commit-hash">{build.commit}</td>
                  <td>
                    {/* Status conveyed only by color */}
                    <span className={`status-badge ${getStatusClass(build.status)}`}>
                    </span>
                  </td>
                  <td className="build-duration">{formatDuration(build.buildTime)}</td>
                  <td>{build.triggeredBy}</td>
                  <td className="timestamp">{formatTimestamp(build.timestamp)}</td>
                  {/* td-headers-attr: references a nonexistent header id */}
                  <td headers="nonexistent-header"></td>
                </tr>
                {expandedBuild === build.id && (
                  <tr className="detail-row">
                    <td colSpan="9">
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
                            <a href="#" className="btn btn-ghost btn-sm">Click here</a>
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

export default BuildTimesDashboardBroken;
