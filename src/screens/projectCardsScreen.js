import React, { useState } from "react";
import { ArrowRight, LockIcon } from "lucide-react";
import { useNavigate, } from "react-router-dom";

const ProjectCardsScreen = () => {
  const navigate = useNavigate();
  const projectColumns = [
    {
      projectTitle: "E-commerce App",
      projects: [
        { projectId: "20241127103210", name: "Node" },
        { projectId: "20241127103156", name: "React" },
        { projectId: "3", name: "Atlas" },
      ],
      lockStatus: false,
    },
    {
      projectTitle: "Banking App",
      projects: [
        { projectId: "6", name: "Node" },
        { projectId: "7", name: "React" },
        { projectId: "8", name: "Atlas" },
      ],
      lockStatus: true,
    },
    {
      projectTitle: "Healthcare App",
      projects: [
        { projectId: "11", name: "Node" },
        { projectId: "12", name: "React" },
        { projectId: "13", name: "Atlas" },
      ],
      lockStatus: true,
    },
    {
      projectTitle: "Contact Form",
      projects: [
        { projectId: "16", name: "Node" },
        { projectId: "17", name: "Web Stack" },
        { projectId: "18", name: "Atlas" },
      ],
      lockStatus: true,
    },
  ];

  const styles = {
    dashboard: {
      fontFamily: "Inter, Arial, sans-serif",
      backgroundColor: "#F0F4F8",
      minHeight: "100vh",
      padding: "20px",
      width: "100%",
      margin: "0 auto",
    },
    columnTitle: {
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "#1E293B",
      marginBottom: "15px",
      paddingBottom: "10px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    projectColumn: {
      display: "flex",
      flexWrap: "wrap",
      gap: "35px",
      marginBottom: "30px",
      justifyContent: "flex-start",
      positon: "absolute",
    },
    projectCard: {
      backgroundColor: "white",
      borderRadius: "18px",
      padding: "20px", // Adjusted for 5 cards per row with gap
      minWidth: "300px",
      maxWidth: "300px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #E2E8F0",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.3s ease",
      marginBottom: "15px",
    },
    projectCardHover: {
      transform: "translateY(-5px)",
    },
    folderIcon: {
      width: "50px",
      height: "50px",
      marginBottom: "10px",
    },
    projectTitle: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#737373",
      marginTop: "30px",
      marginBottom: "10px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    progressContainer: {
      height: "8px",
      backgroundColor: "#E2E8F0",
      borderRadius: "4px",
      marginTop: "auto",
      overflow: "hidden",
    },
  };

  // Media query styles for responsiveness
  const responsiveStyles = `
    @media (max-width: 1200px) {
      .project-card {
        width: calc(25% - 15px) !important;
      }
    }
    @media (max-width: 900px) {
      .project-card {
        width: calc(33.333% - 15px) !important;
      }
    }
    @media (max-width: 600px) {
      .project-card {
        width: calc(50% - 15px) !important;
      }
    }
    @media (max-width: 400px) {
      .project-card {
        width: 100% !important;
      }
    }
  `;

  const FolderIcon = ({ color }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={color}
      style={styles.folderIcon}
    >
      <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121a.75.75 0 00.53.22h5.362a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15A4.483 4.483 0 001.5 10.146z" />
    </svg>
  );

  const ProjectCard = ({ project }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="project-card"
        style={{
          ...styles.projectCard,
          ...(isHovered ? styles.projectCardHover : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          navigate("/codeEnv", {
            state: { projectId: project.projectId },
          });
        }}
      >
        <FolderIcon color={"#363636"} />
        <div style={styles.projectTitle}>{project.name}</div>
        <div
          style={{
            width: "100%",
            height: "8px",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            color: "#363636",
            paddingTop: "20px",
            paddingBottom: "7px",
          }}
        >
          <ArrowRight />
        </div>
      </div>
    );
  };

  const ProjectColumn = ({
    projectTitle,
    projects,
    titleColor,
    projectLock,
  }) => (
    <div>
      <div
        style={{
          ...styles.columnTitle,
          color: titleColor,
        }}
      >
        {projectTitle}
      </div>
      <div style={{ position: "relative", justifyContent: "center" }}>
        {projectLock && (
          <div
            style={{
              backgroundColor: "#000",
              width: "100%",
              position: "absolute",
              height: "100%",
              borderRadius: "12px",
              opacity: 0.6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockIcon color={"#fff"} size={90} />
          </div>
        )}

        <div style={styles.projectColumn}>
          {projects.map((project) => (
            <ProjectCard key={project.projectId} project={project} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.dashboard}>
      {projectColumns.map((column, index) => (
        <ProjectColumn
          key={index}
          projectTitle={column.projectTitle}
          projects={column.projects}
          titleColor={"#363636"} // Default color
          projectLock={column.lockStatus}
        />
      ))}
    </div>
  );
};

export default ProjectCardsScreen;
