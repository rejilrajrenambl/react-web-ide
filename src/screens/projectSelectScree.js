import React, { useState, useEffect } from "react";
import {
  FolderPlus,
  FolderOpen,
  ChevronDown,
  Clock,
  Code2,
  Plus,
  Trash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectSelectScree = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [projectType, setProjectType] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [existingProjects, setExistingProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Sample existing projects data

  const handleCreateProject = async () => {
    if (!projectType || !projectTitle) {
      setError("Please select a project type and enter a project title.");
      return;
    }

    setLoading(true);
    setError("");

    const newProject = {
      projectName: projectTitle,
      lang: projectType,
    };

    try {
      const response = await fetch("http://localhost:4800/add-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });
const data = await response.json();
      if (response.ok) {
        
        alert("Project created successfully!");
        setProjectTitle("");
        setProjectType("");
        console.log("data", data.projectId);
        navigate("/codeEnv", { state: { projectId: data.projectId } });
      } else {
        setError(data.error || "Failed to create project.");
      }
    } catch (err) {
      setError("An error occurred while creating the project.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProjectAPI = async (projectId) => {
    try {
      const response = await fetch("http://localhost:4800/delete-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });
const data = await response.json();
      if (response.ok) {
        
        console.log("response", data.message);
        fetchProjects();
      } else {
        console.log(data.error || "Failed to delete project.");
      }
    } catch (err) {
      console.log("An error occurred while deleting the project.");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:4800/get-projects");

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setExistingProjects(data);
    } catch (err) {
      setError("An error occurred while fetching projects.");
    }
  };

  useEffect(() => {
    if (selectedOption === "existing") {
      fetchProjects();
    }
  }, [selectedOption]);

  const styles = {
    container: {
      backgroundColor: "#1E1E1E",
      minHeight: "100vh",
      padding: "2rem",
      color: "#ffffff",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    card: {
      backgroundColor: "#2D2D2D",
      borderRadius: "8px",
      padding: "2rem",
      maxWidth: "800px",
      margin: "0 auto",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    title: {
      fontSize: "24px",
      marginBottom: "2rem",
      color: "#ffffff",
      borderBottom: "1px solid #404040",
      paddingBottom: "1rem",
    },
    optionContainer: {
      display: "flex",
      gap: "1rem",
      marginBottom: "2rem",
    },
    optionButton: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "1rem",
      backgroundColor: "#363636",
      border: "1px solid #404040",
      borderRadius: "6px",
      color: "#ffffff",
      cursor: "pointer",
      transition: "background-color 0.2s",
      width: "100%",
    },
    selectedButton: {
      backgroundColor: "#404040",
      borderColor: "#585858",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    dropdown: {
      position: "relative",
    },
    dropdownButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      padding: "0.75rem 1rem",
      backgroundColor: "#363636",
      border: "1px solid #404040",
      borderRadius: "4px",
      color: "#ffffff",
      cursor: "pointer",
    },
    dropdownMenu: {
      position: "absolute",
      top: "100%",
      left: "0",
      right: "0",
      backgroundColor: "#363636",
      border: "1px solid #404040",
      borderRadius: "4px",
      marginTop: "4px",
      zIndex: 10,
    },
    dropdownItem: {
      padding: "0.75rem 1rem",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "#404040",
      },
    },
    input: {
      padding: "0.75rem 1rem",
      backgroundColor: "#363636",
      border: "1px solid #404040",
      borderRadius: "4px",
      color: "#ffffff",
      width: "100%",
    },
    projectList: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    projectItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem",
      backgroundColor: "#363636",
      border: "1px solid #404040",
      borderRadius: "4px",
      cursor: "pointer",
    },
    projectInfo: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    stack: {
      backgroundColor: "#404040",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
      fontSize: "0.875rem",
    },
    timestamp: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      color: "#888888",
      fontSize: "0.875rem",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Project Selector</h1>

        <div style={styles.optionContainer}>
          <button
            style={{
              ...styles.optionButton,
              ...(selectedOption === "new" ? styles.selectedButton : {}),
            }}
            onClick={() => setSelectedOption("new")}
          >
            <FolderPlus size={20} />
            Create New Project
          </button>

          <button
            style={{
              ...styles.optionButton,
              ...(selectedOption === "existing" ? styles.selectedButton : {}),
            }}
            onClick={() => setSelectedOption("existing")}
          >
            <FolderOpen size={20} />
            Open Existing Project
          </button>
        </div>

        {selectedOption === "new" && (
          <div style={styles.form}>
            <div style={styles.dropdown}>
              <button
                style={styles.dropdownButton}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {projectType || "Select Project Type"}
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div style={styles.dropdownMenu}>
                  {["Python", "React", "Webstack", "Node"].map((type) => (
                    <div
                      key={type}
                      style={styles.dropdownItem}
                      onClick={() => {
                        setProjectType(type);
                        setDropdownOpen(false);
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              style={styles.input}
              type="text"
              placeholder="Project Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />

            {error && <div style={{ color: "red" }}>{error}</div>}

            <button
              style={{
                marginTop: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#cc1eeb",
                padding: "5px 30px",
                border: "none",
                borderRadius: "20px",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                width: "120px",
              }}
              onClick={handleCreateProject}
              disabled={loading}
            >
              {loading ? "Creating..." : "ADD"}
              <Plus
                style={{
                  color: "#fff",
                  width: "27px",
                  height: "27px",
                }}
              />
            </button>
          </div>
        )}

        {selectedOption === "existing" && (
          <div style={styles.projectList}>
            {existingProjects.length > 0 ? (
              existingProjects.map((project) => (
                <div
                  key={project.projectId}
                  style={styles.projectItem}
                  onClick={() => {
                    navigate("/codeEnv", {
                      state: { projectId: project.projectId },
                    });
                  }}
                >
                  <div style={styles.projectInfo}>
                    <Code2 size={20} />
                    <span>{project.projectName}</span>
                    <span style={styles.stack}>{project.lang}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <div style={styles.timestamp}>
                      <Clock size={16} />
                      {new Date(project.lastUpdatedDate).toLocaleDateString()}
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProjectAPI(project.projectId);
                      }}
                    >
                      <Trash size={16} color="#e32f45" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No projects available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelectScree;
