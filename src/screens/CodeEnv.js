import React, { useRef, useEffect, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
  SandpackConsole,
  useActiveCode,
} from "@codesandbox/sandpack-react";

import { Modal, Box, Typography, Button } from "@mui/material";
import {useNavigate,useLocation} from 'react-router-dom';
import {
  Message,
  PlayArrow,
  Code,
  Home,
  Replay,
  Close,
} from "@mui/icons-material";
import {
  Copy,
  Plus,
  Trash2,
  X,
  File,
  Folder,
  ChevronDown,
  ChevronRight,
  Scissors,
  ClipboardPaste,
  Edit2,
  RefreshCw,
  TerminalIcon,
  EllipsisIcon,
  ArrowRight, LockIcon 
} from "lucide-react";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { python } from "@codemirror/lang-python";

const CodeEnv = () => {
  const navigate = useNavigate();
  const router = useLocation()
  const { projectId } = router.state;
  const [selectedProject, setSelectedProject] = useState(null);
  const [visibleSaveBtn, setVisibleSaveBtn] = useState(null);
  const [projectLang, setProjectLang] = useState("");
  const [projectName, setProjectName] = useState("");
  const [selectedFileNameState, setSelectedFileNameState] = useState("");
  const selectedFileNameRef = useRef(null);
  const selectedFileContentRef = useRef(null);
  const [isOn, setIsOn] = useState(2);
  const [codeOutput, setCodeOutput] = useState("");

  const handleToggle = (val) => {
    setIsOn(val);
  };

  useEffect(() => {
    const fetchProjectsDetails = async () => {
      console.log("projectId checking", projectId);
      try {
        const response = await fetch(
          "http://localhost:4800/get-project-details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ projectId }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const projectData = await response.json();
        const sandpackFiles = {};
        projectData.fileSets.forEach((fileSet) => {
          sandpackFiles[fileSet.filePath] = {
            code: fileSet.code,
          };
        });

        setSelectedProject({
          ...projectData,
          files: sandpackFiles,
        });
        setProjectLang(projectData.lang);
        setProjectName(projectData.projectName);
        console.log("projectData", projectData);
      } catch (err) {
        console.log("An error occurred while fetching projects.", err);
      }
    };
    fetchProjectsDetails();
  }, [projectId]);

  const addFileAPI = async (fileName, projectIdData) => {
    if (!fileName && projectIdData) {
      return;
    }
    try {
      const response = await fetch("http://localhost:4800/add-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectIdData,
          filePath: fileName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("response", data.message);
      } else {
        console.log("Failed to add file.");
      }
    } catch (err) {
      console.log("An error occurred while creating the project.");
    }
  };

  const updateCodeAPI = async (projectIdData, fileName, fileContent) => {
    console.log("projectIdData", projectIdData);
    console.log("fileName", fileName);
    console.log("fileContent", fileContent);
    if (!fileName || !projectIdData) {
      console.error("Invalid input data.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4800/update-file-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectIdData,
          filePath: fileName,
          code: fileContent,
        }),
      });
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log("File updated successfully:", data.message);
      } else {
        const error = await response.json();
        console.error(
          "Failed to update file:",
          error.error || "Unknown error."
        );
      }
    } catch (err) {
      console.error("An error occurred while updating the file:", err.message);
    }
  };

  const renameFileAPI = async (projectIdData, newPath, oldPath) => {
    if (!newPath && projectIdData && oldPath) {
      return;
    }
    if (oldPath === newPath) {
      return;
    }
    console.log("newpath", newPath);
    console.log("oldPath", oldPath);

    try {
      const response = await fetch("http://localhost:4800/rename-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectIdData,
          oldFilePath: oldPath,
          newFilePath: newPath,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("response", data.message);
      } else {
        console.log("Failed to add file.");
      }
    } catch (err) {
      console.log("An error occurred while creating the project.");
    }
  };

  const deleteFileAPI = async (projectIdData, filePath) => {
    if (!filePath && projectIdData) {
      return;
    }
    try {
      const response = await fetch("http://localhost:4800/delete-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectIdData,
          filePath: filePath,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("response", data.message);
      } else {
        console.log("Failed to delete file.");
      }
    } catch (err) {
      console.log("An error occurred while creating the project.");
    }
  };

  const handleRunCode = async () => {
    try {
      console.log("codeFromEditor", selectedFileContentRef.current);
      const codeFromEditor = selectedFileContentRef.current;
      const response = await fetch("http://localhost:4800/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codeFromEditor }),
      });
      const data = await response.json();
      setIsOn(1);
      setCodeOutput(data.result);
    } catch (error) {
      setCodeOutput("Error executing code");
    }
  };

  const containerStyles = {
    position: "relative",
    backgroundColor: "#111827",
    padding: "20px",
  };

  const editorContainerStyles = {
    maxWidth: "95%",
    margin: "0 auto",
  };

  const titleStyles = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "white",
    marginBottom: "50px",
  };
  const subTitleStyles = {
    fontSize: "18px",
    fontWeight: "500",
    color: "white",
    marginTop: "10px",
    top: "10px",
    left: "50%",
    transform: "translate(-50%, -50%)",
    position: "absolute",
  };

  const editorWrapperStyles = {
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #374151",
  };

  const mainLayoutStyles = {
    display: "flex",
    height: "calc(100vh - 8rem)",
    width: "100%",
  };

  const fileExplorerStyles = {
    width: "224px",
    backgroundColor: "#1F2937",
    borderRight: "1px solid #374151",
  };

  const fileExplorerHeaderStyles = {
    padding: "16px",
    borderBottom: "1px solid #374151",
  };

  const fileExplorerTitleStyles = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#9CA3AF",
  };

  const editorPaneStyles = {
    flex: 1,
    display: "flex",
    flexDirection: "row",
  };

  const codeEditorStyles = {
    borderBottom: "1px solid #374151",
    width: "100%",
  };

  const previewStyles = {
    height: "100%",
    width: "100%",
  };

  const modalFileContainerStyle = {
    position: 'absolute',
    top: 25,
    left: 0,
    zIndex: 1000
  };

  // Dynamic modal content style
  const modalFileContentStyle = {
    backgroundColor: "#333333",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: `0px 10px rgba(0,0,0,0.2)`,
    overflow: "hidden",
    paddingTop:"20px"
  };

   const [isFileModalOpen, setIsFileModalOpen] = useState(false);
   const modalRef = useRef(null);

   const openFileModal = () => {
    setIsFileModalOpen(true);
  };

  // Close modal handler
  const closeFileModal = () => {
    setIsFileModalOpen(false);
    
  };

   const handleClickOutside = (event) => {
     if (modalRef.current && !modalRef.current.contains(event.target)) {
       closeFileModal();
     }
   };
useEffect(() => {
  if (isFileModalOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }
  // Cleanup event listener when the component is unmounted or isFileModalOpen changes
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isFileModalOpen]);

  const [isKeyGenModalOpen, setIsKeyGenModalOpen] = useState(false);
  const [isKeyGenHovered, setIsKeyGenHovered] = useState({
    button: false,
    closeButton: false,
    copyButton: false,
  });
  const [isKeyGenCopied, setIsKeyGenCopied] = useState(false);
  const apiKeyGen = "sk_test_example_key_12345";

//   const copyToKeyGenClipboard = async () => {
//     try {
//     //   await navigator.clipboard.writeText(apiKey);
//       setIsKeyGenCopied(true);
//       setTimeout(() => setIsKeyGenCopied(false), 2000);
//     } catch (err) {
//       console.error("Failed to copy text: ", err);
//     }
//   };

  const apiKeyStyles = {
    button: {
      backgroundColor: "#cc1eeb",
      padding: "5px 30px",
      border: "none",
      borderRadius: "10px",
      color: "#fff",
      zIndex: 99,
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "5px",
    },
    buttonHover: {
      backgroundColor: "#1d4ed8",
      boxShadow: "0 4px 6px rgba(0,0,0,0.12)",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(5px)",
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      width: "90%",
      maxWidth: "500px",
      position: "relative",
      boxShadow:
        "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      paddingBottom: "16px",
      borderBottom: "1px solid #e5e7eb",
    },
    modalTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      margin: 0,
    },
    closeButton: {
      background: "transparent",
      border: "none",
      color: "#6b7280",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    closeButtonHover: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
    },
    keyContainer: {
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      border: "1px solid #e5e7eb",
    },
    keyText: {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#374151",
      flex: 1,
      overflowX: "auto",
      whiteSpace: "nowrap",
    },
    copyButton: {
      background: "transparent",
      border: "none",
      padding: "8px",
      borderRadius: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      color: "#6b7280",
      transition: "all 0.2s ease",
    },
    copyButtonHover: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
    },
    successMessage: {
      color: "#059669",
      fontSize: "14px",
      marginTop: "12px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
  };

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
    ];
   const styles = {
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
       flexDirection: "column",
       marginBottom: "30px",
       justifyContent: "flex-start",
       positon: "absolute",
     },
     projectCard: {
       padding: "10px", // Adjusted for 5 cards per row with gap
       minWidth: "300px",
       maxWidth: "300px",
       display: "flex",
       flexDirection: "row",
       gap: "10px",
       alignItems: "center",
     },

     folderIcon: {
       width: "20px",
       height: "20px",
     },
     projectTitle: {
       fontSize: "1rem",
       fontWeight: "600",
       color: "#fff",
       textOverflow: "ellipsis",
       whiteSpace: "nowrap",
     },
   };

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
           backgroundColor: isHovered ? "#cc1eeb" : "transparent",
           opacity: 0.7,
         }}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
         onClick={() => {
          closeFileModal()
           navigate("/codeEnv",{
             state: { projectId: project.projectId },
           });
         }}
       >
         <FolderIcon color={"#fff"} />
         <div style={styles.projectTitle}>{project.name}</div>
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
           {projects.map((project) => {
              if (project.projectId === projectId) {
                      return null; // Skip rendering this column
                    }
                   return (
                     <ProjectCard key={project.projectId} project={project}  />
                   );})}
         </div>
       </div>
     </div>
   );


  const CustomSandpackFileExplorer = () => {
    const [fileName, setFileName] = useState("");
    const [expandedFolders, setExpandedFolders] = useState(new Set([""]));
    const { sandpack } = useSandpack();
    const { files, activeFile, setActiveFile } = sandpack;
    const [openInputFileName, setOpenInputFileName] = useState(false);
    const [openInputFileFolder, setOpenInputFileFolder] = useState(null);
    const [isFolder, setIsFolder] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [clipboard, setClipboard] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isRenaming, setIsRenaming] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const renameInputRef = useRef(null);

    const code = useActiveCode(); // Get the active code from the current file

    useEffect(() => {
      if (activeFile) {
        console.log(`File: ${activeFile}`);
        selectedFileNameRef.current = activeFile;
        
        setSelectedFileNameState(activeFile);
        const storedFileContent = selectedProject?.files?.[activeFile]?.code;
        if (storedFileContent !== undefined) {
      if (storedFileContent === code.code) {
        setVisibleSaveBtn(false)
        console.log('No change in the file content.');
      } else {
        setVisibleSaveBtn(true)
        console.log('There is a change in the file content.');
      }
    } else {
      setVisibleSaveBtn(false)
      console.log('File not found in the selected project.');
    }
      }
      console.log("Current code:", code);

      selectedFileContentRef.current = code.code;
    }, [code]);

    const containerStyles = {
      backgroundColor: "#1e293b",
      color: "#f1f5f9",
      width: "250px",
      height: "100%",
      overflow: "auto",
    };

    const headerStyles = {
      padding: "12px",
      borderBottom: "1px solid #334155",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    };

    const buttonStyles = {
      backgroundColor: "transparent",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      alignItems: "center",
    };

    const fileListStyles = {
      padding: "8px 0",
    };

    const itemStyles = {
      display: "flex",
      alignItems: "center",
      padding: "6px 12px",
      cursor: "pointer",
      color: "#e2e8f0",
      fontSize: "13px",
      position: "relative",
      userSelect: "none",
    };

    const activeFileStyles = {
      backgroundColor: "#334155",
    };

    const deleteButtonStyles = {
      backgroundColor: "transparent",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      padding: "4px",
      display: "none",
      position: "absolute",
      right: "8px",
      top: "50%",
      transform: "translateY(-50%)",
    };

    const newFileInputStyles = {
      width: "70%",
      padding: "6px 10px",
      backgroundColor: "#334155",
      border: "none",
      color: "#f1f5f9",
      fontSize: "13px",
      outline: "none",
      borderRadius: "10px",
    };

    const addButtonStyles = {
      backgroundColor: "#cc1eeb",
      padding: "4px 10px",
      borderRadius: "10px",
      width: "20%",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    };

    const toggleTypeButtonStyles = {
      backgroundColor: "#334155",
      padding: "4px 10px",
      borderRadius: "10px",
      color: "#f1f5f9",
      border: "none",
      cursor: "pointer",
      fontSize: "13px",
      width: "100%",
      marginTop: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
    };

    const contextMenuStyles = {
      position: "fixed",
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "4px",
      padding: "4px 0",
      zIndex: 1000,
      minWidth: "160px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    };

    const contextMenuItemStyles = {
      padding: "6px 12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#e2e8f0",
      fontSize: "13px",
      ":hover": {
        backgroundColor: "#334155",
      },
    };

    const searchInputStyles = {
      ...newFileInputStyles,
      margin: "0 12px 8px",
      width: "calc(100% - 24px)",
    };

   
    useEffect(() => {
      const handleClickOutside = () => setContextMenu(null);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isRenaming && renameInputRef.current) {
        renameInputRef.current.focus();
        renameInputRef.current.select();
      }
    }, [isRenaming]);

    const handleContextMenu = (e, item) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.pageX, y: e.pageY, item });
      setSelectedItem(item);
    };

    const handleCopy = (item) => {
      setClipboard({ action: "copy", item });
      setContextMenu(null);
    };

    const handleCut = (item) => {
      setClipboard({ action: "cut", item });
      setContextMenu(null);
    };

    const handlePaste = (targetPath) => {
      if (!clipboard) return;

      const sourcePath = clipboard.item.path;
      const sourceContent = files[sourcePath].code;
      const fileName = sourcePath.split("/").pop();
      const newPath = targetPath ? `${targetPath}/${fileName}` : fileName;

      sandpack.addFile(newPath, sourceContent);

      if (clipboard.action === "cut") {
        sandpack.deleteFile(sourcePath);
      }

      setClipboard(null);
      setContextMenu(null);
    };

    const handleRename = (item) => {
      setIsRenaming(item.path);
      setContextMenu(null);
    };

    const handleRenameSubmit = (oldPath, newName) => {
      const isFolder = !files[oldPath]; // If path doesn't exist as a file, it's a folder

      if (isFolder) {
        // For folders, we need to update all nested files
        const oldPathPrefix = oldPath + "/";
        const pathParts = oldPath.split("/");
        pathParts.pop(); // Remove old folder name
        const newPath = [...pathParts, newName].join("/");
        const newPathPrefix = newPath + "/";

        // Get all files that need to be updated
        const filesToUpdate = Object.keys(files).filter((filePath) =>
          filePath.startsWith(oldPathPrefix)
        );

        // Update each file with new path
        filesToUpdate.forEach((oldFilePath) => {
          const newFilePath = oldFilePath.replace(oldPathPrefix, newPathPrefix);
          sandpack.addFile(newFilePath, files[oldFilePath].code);
          sandpack.deleteFile(oldFilePath);
          renameFileAPI(projectId, newFilePath, oldFilePath);
        });

        // Update expanded folders set
        const newExpanded = new Set(
          Array.from(expandedFolders).map((path) =>
            path === oldPath
              ? newPath
              : path.startsWith(oldPathPrefix)
                ? path.replace(oldPathPrefix, newPathPrefix)
                : path
          )
        );
        setExpandedFolders(newExpanded);
      } else {
        // For files, just update the single file
        const pathParts = oldPath.split("/");
        pathParts.pop();
        const newPath = [...pathParts, newName].join("/");

        sandpack.addFile(newPath, files[oldPath].code);
        sandpack.deleteFile(oldPath);
        renameFileAPI(projectId, newPath, oldPath);
      }

      setIsRenaming(null);
    };

    const handleDragStart = (e, item) => {
      e.dataTransfer.setData("text/plain", item.path);
      setDraggedItem(item);
    };

    const handleDragOver = (e, target) => {
      e.preventDefault();
      if (target?.type === "folder") {
        setDropTarget(target.path);
      }
    };

    const handleDrop = (e, target) => {
      e.preventDefault();
      if (!draggedItem || !target || draggedItem.path === target.path) return;

      const fileName = draggedItem.path.split("/").pop();
      const newPath = `${target.path}/${fileName}`;

      sandpack.addFile(newPath, files[draggedItem.path].code);
      sandpack.deleteFile(draggedItem.path);

      setDraggedItem(null);
      setDropTarget(null);
    };

    // Function to organize files into a folder structure
    const getFileTree = () => {
      const tree = {};
      Object.keys(files).forEach((path) => {
        if (projectLang === "python" && path === "/package.json") return;
        if (projectLang === "python" && path === "/index.js") return;
        if (projectLang === "webstack" && path === "/package.json") return;
        const parts = path.split("/").filter(Boolean);
        let current = tree;
        parts.forEach((part, index) => {
          if (index === parts.length - 1) {
            current[part] = { type: "file", path };
          } else {
            current[part] = current[part] || { type: "folder", children: {} };
            current = current[part].children;
          }
        });
      });
      return tree;
    };

    const toggleFolder = (path) => {
      const newExpanded = new Set(expandedFolders);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      setExpandedFolders(newExpanded);
    };

    const handleNewItem = (event) => {
      event.preventDefault();
      if (fileName.trim()) {
        console.log("fileName", fileName);
        if (isFolder) {
          console.log("top");
          sandpack.addFile(`${fileName}/.gitkeep`, "");
          addFileAPI(`/${fileName}/.gitkeep`, projectId);
        } else {
          console.log("bottom");

          sandpack.addFile(fileName, "");
          addFileAPI(`/${fileName}`, projectId);
        }
        setFileName("");
        setOpenInputFileName(false);
      }
    };

    const handleDeleteFile = (filePath, event) => {
      console.log("filePath", filePath);
      if (Object.keys(files).length > 1) {
        sandpack.deleteFile(filePath);
        deleteFileAPI(projectId, filePath);
      }
    };

    const FileItem = ({ name, path, level = 0 }) => {
      const [isHovered, setIsHovered] = useState(false);
      const isActive = path === activeFile;
      const isRenamingThis = isRenaming === path;

      const itemStyle = {
        ...itemStyles,
        ...(isActive ? activeFileStyles : {}),
        ...(dropTarget === path ? { backgroundColor: "#1e40af" } : {}),
        paddingLeft: `${level * 16 + 12}px`,
      };

      if (isRenamingThis) {
        return (
          <div style={itemStyle}>
            <File size={14} style={{ marginRight: "8px", flexShrink: 0 }} />
            <input
              ref={renameInputRef}
              defaultValue={name}
              style={newFileInputStyles}
              onBlur={(e) => handleRenameSubmit(path, e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit(path, e.target.value);
                }
              }}
            />
          </div>
        );
      }

      return (
        <div
          style={itemStyle}
          onClick={() => {
            setActiveFile(path);
            console.log("path", path);
            console.log("path content", { code: files[path]?.code });
            sandpack.openFile(path);
            selectedFileNameRef.current = path;
            selectedFileContentRef.current = files[path]?.code;
          }}
          onContextMenu={(e) => handleContextMenu(e, { type: "file", path })}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          draggable
          onDragStart={(e) => handleDragStart(e, { type: "file", path })}
          onDragOver={(e) => handleDragOver(e, { type: "file", path })}
          onDrop={(e) => handleDrop(e, { type: "file", path })}
        >
          <File size={14} style={{ marginRight: "8px", flexShrink: 0 }} />
          {name}
          {isHovered && (
            <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
              <button
                style={deleteButtonStyles}
                onClick={(e) => handleDeleteFile(path, e)}
              >
                <Trash2 size={14} />
              </button>
              <button
                style={deleteButtonStyles}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename({ type: "file", path });
                }}
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>
      );
    };

    const ContextMenu = () => {
      if (!contextMenu) return null;

      return (
        <>
          {!contextMenu.isCreateMenu && (
            <div
              style={{
                ...contextMenuStyles,
                left: contextMenu.x,
                top: contextMenu.y,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={contextMenuItemStyles}
                onClick={() => handleCopy(contextMenu.item)}
              >
                <Copy size={14} /> Copy
              </div>
              <div
                style={contextMenuItemStyles}
                onClick={() => handleCut(contextMenu.item)}
              >
                <Scissors size={14} /> Cut
              </div>
              {clipboard && (
                <div
                  style={contextMenuItemStyles}
                  onClick={() => handlePaste(contextMenu.item?.path)}
                >
                  <ClipboardPaste size={14} /> Paste
                </div>
              )}
              <div
                style={contextMenuItemStyles}
                onClick={() => handleRename(contextMenu.item)}
              >
                <Edit2 size={14} /> Rename
              </div>
              <div
                style={contextMenuItemStyles}
                onClick={() => {
                  handleDeleteFile(contextMenu.item.path);
                  setContextMenu(null);
                }}
              >
                <Trash2 size={14} /> Delete
              </div>
            </div>
          )}
        </>
      );
    };

    const handleNewItemInFolder = (folderPath) => {
      if (fileName.trim()) {
        const newPath = `${folderPath}/${fileName}`;
        if (isFolder) {
          sandpack.addFile(`${newPath}/.gitkeep`, "");
          addFileAPI(`/${newPath}/.gitkeep`, projectId);
        } else {
          sandpack.addFile(newPath, "");
          addFileAPI(`/${newPath}`, projectId);
        }
        setFileName("");
        setOpenInputFileFolder(null);
        setIsFolder(false);
        setExpandedFolders(new Set([...expandedFolders, folderPath]));
      }
    };

    const FolderItem = ({ name, children, path, level = 0 }) => {
      const [isHovered, setIsHovered] = useState(false);
      const isExpanded = expandedFolders.has(path);
      const isAddingFile = openInputFileFolder === path;
      const isRenamingThis = isRenaming === path;

      useEffect(() => {
        if (isAddingFile && !isExpanded) {
          toggleFolder(path);
        }
      }, [isAddingFile, isExpanded, path]);

      const folderStyle = {
        ...itemStyles,
        paddingLeft: `${level * 16 + 12}px`,
        ...(dropTarget === path ? { backgroundColor: "#1e40af" } : {}),
      };

      if (isRenamingThis) {
        return (
          <div style={folderStyle}>
            <Folder size={14} style={{ marginRight: "8px", flexShrink: 0 }} />
            <input
              ref={renameInputRef}
              defaultValue={name}
              style={newFileInputStyles}
              onBlur={(e) => {
                const newName = e.target.value.trim();
                if (newName && newName !== name) {
                  handleRenameSubmit(path, newName);
                } else {
                  setIsRenaming(null);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const newName = e.target.value.trim();
                  if (newName && newName !== name) {
                    handleRenameSubmit(path, newName);
                  } else {
                    setIsRenaming(null);
                  }
                }
              }}
            />
          </div>
        );
      }

      return (
        <>
          <div
            style={folderStyle}
            onClick={() => toggleFolder(path)}
            onContextMenu={(e) =>
              handleContextMenu(e, { type: "folder", path })
            }
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            draggable
            onDragStart={(e) => handleDragStart(e, { type: "folder", path })}
            onDragOver={(e) => handleDragOver(e, { type: "folder", path })}
            onDrop={(e) => handleDrop(e, { type: "folder", path })}
          >
            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <Folder size={14} style={{ marginRight: "8px", flexShrink: 0 }} />
              {name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {isHovered && (
                <>
                  <button
                    style={{ ...buttonStyles, padding: "2px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenInputFileFolder(path);
                      setIsFolder(false);
                    }}
                    title="New File"
                  >
                    <File size={12} />
                  </button>
                  <button
                    style={{ ...buttonStyles, padding: "2px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenInputFileFolder(path);
                      setIsFolder(true);
                    }}
                    title="New Folder"
                  >
                    <Folder size={12} />
                  </button>
                </>
              )}
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
          </div>

          {/* Folder content */}
          {isExpanded && (
            <div>
              {isAddingFile && (
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    paddingLeft: `${level * 16 + 28}px`,
                    margin: "4px 0",
                  }}
                >
                  <input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleNewItemInFolder(path);
                      }
                    }}
                    style={newFileInputStyles}
                    placeholder={isFolder ? "folder-name" : "file-name.js"}
                    autoFocus
                  />
                  <button
                    onClick={() => handleNewItemInFolder(path)}
                    style={addButtonStyles}
                  >
                    ADD
                  </button>
                </div>
              )}
              {Object.entries(children)
                .filter(([childName]) =>
                  childName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(([childName, child]) => {
                  const childPath = path ? `${path}/${childName}` : childName;
                  return child.type === "folder" ? (
                    <FolderItem
                      key={childPath}
                      name={childName}
                      children={child.children}
                      path={childPath}
                      level={level + 1}
                    />
                  ) : (
                    <FileItem
                      key={childPath}
                      name={childName}
                      path={child.path}
                      level={level + 1}
                    />
                  );
                })}
            </div>
          )}
        </>
      );
    };

    return (
      <div style={containerStyles}>
        <div style={headerStyles}>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyles}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNewItem(e);
              setOpenInputFileFolder(null);
            }}
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            {openInputFileName ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    style={newFileInputStyles}
                    placeholder={isFolder ? "folder/name" : "path/to/file.js"}
                    autoFocus
                  />
                  <button type="submit" style={addButtonStyles}>
                    ADD
                  </button>
                </div>
                <button
                  type="button"
                  style={toggleTypeButtonStyles}
                  onClick={() => setIsFolder(!isFolder)}
                >
                  {isFolder ? <File size={14} /> : <Folder size={14} />}
                  Switch to {isFolder ? "File" : "Folder"}
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenInputFileName(true);
                  }}
                  style={buttonStyles}
                  title="New File/Folder"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExpandedFolders(new Set([""]));
                  }}
                  style={buttonStyles}
                  title="Refresh Explorer"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            )}
          </form>
        </div>

        <div style={fileListStyles}>
          {Object.entries(getFileTree())
            .filter(
              ([name]) =>
                searchTerm === "" ||
                name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(([name, item]) => {
              const path = item.type === "file" ? item.path : name;
              return item.type === "folder" ? (
                <FolderItem
                  key={path}
                  name={name}
                  children={item.children}
                  path={path}
                  level={0}
                />
              ) : (
                <FileItem key={path} name={name} path={path} level={0} />
              );
            })}

          {/* Show empty state when no files match search */}
          {searchTerm &&
            Object.entries(getFileTree()).filter(([name]) =>
              name.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
              <div
                style={{
                  padding: "12px",
                  color: "#94a3b8",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                No matching files found
              </div>
            )}
        </div>

        <div
          tabIndex={0}
          onKeyDown={(e) => {
            if (selectedItem) {
              // Copy
              if (e.ctrlKey && e.key === "c") {
                handleCopy(selectedItem);
              }
              // Cut
              if (e.ctrlKey && e.key === "x") {
                handleCut(selectedItem);
              }
              // Paste
              if (e.ctrlKey && e.key === "v" && clipboard) {
                handlePaste(
                  selectedItem.type === "folder" ? selectedItem.path : null
                );
              }
              // Rename - F2
              if (e.key === "F2") {
                handleRename(selectedItem);
              }
              // Delete
              if (e.key === "Delete") {
                handleDeleteFile(selectedItem.path);
                setSelectedItem(null);
              }
            }
          }}
          style={{ outline: "none" }}
        />

        <ContextMenu />

        {dropTarget && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(30, 64, 175, 0.1)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    );
  };


  return (
    <>
      <div style={{ ...containerStyles, height: "100vh", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            cursor: "pointer",
            position: "absolute",
            top: "60px",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100px",
              padding: "10px",
              backgroundColor:
                isOn === 1
                  ? "#f4433698"
                  : isOn === 2
                    ? "#4caf4fa9"
                    : "#ff980080",
              borderRadius: "13px",
              transition: "background-color 0.3s ease",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "5px",
                left: isOn === 1 ? "8px" : "60px",
                width: "30px",
                height: "30px",
                backgroundColor: "white",
                borderRadius: "10px",
                transition: "left 0.3s ease",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "0 4px", // Add padding for better spacing between icons
                zIndex: 1,
              }}
            >
              <TerminalIcon
                style={{
                  color: isOn === 1 ? "#f4433698" : "#fff",
                  width: "20px",
                  height: "20px",
                }}
                onClick={() => handleToggle(1)}
              />
              <Code
                style={{
                  color: isOn === 2 ? "#4caf4fa9" : "#fff",
                  width: "20px",
                  height: "20px",
                }}
                onClick={() => handleToggle(2)}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            top: "60px",
            left: "60px",
            position: "absolute",
            border: "1px solid #fff",
            width: 37,
            height: 37,
            borderRadius: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <EllipsisIcon
            style={{
              color: "#fff",
            }}
            strokeWidth={3}
            onClick={openFileModal}
          />
          {isFileModalOpen && (
            <div
              ref={modalRef}
              style={modalFileContainerStyle}
              onClick={closeFileModal}
            >
              <div
                style={modalFileContentStyle}
                onClick={(e) => e.stopPropagation()}
              >
                <div>
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
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            color: "#cc1eeb",
            top: "60px",
            right: "85px",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            style={{
              ...apiKeyStyles.button,
              ...(isKeyGenHovered.button ? apiKeyStyles.buttonHover : {}),
            }}
            onMouseEnter={() =>
              setIsKeyGenHovered((prev) => ({ ...prev, button: true }))
            }
            onMouseLeave={() =>
              setIsKeyGenHovered((prev) => ({ ...prev, button: false }))
            }
            onClick={() => setIsKeyGenModalOpen(true)}
          >
            get API Endpoint
          </button>

          {projectLang === "python" && (
            <button
              //   onClick={handleNext}
              onClick={handleRunCode}
              style={{
                backgroundColor: "transparent",
                padding: "5px 30px",
                border: "1px solid #cc1eeb",
                borderRadius: "20px",
                color: "#cc1eeb",
                zIndex: 99,
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Compile
            </button>
          )}
        </div>
        <div
          style={{
            top: "-5px",
            right: "70px",
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div>{selectedFileNameState}</div>
          <button
            onClick={() => {
              updateCodeAPI(
                projectId,
                selectedFileNameRef.current,
                selectedFileContentRef.current
              );
            }}
            disabled={visibleSaveBtn}
            style={{
              margin: "1rem",
              backgroundColor: "#cc1eeb",
              padding: "5px 30px",
              border: "none",
              borderRadius: "20px",
              color: "#fff",
              zIndex: 99,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "5px",
              opacity: visibleSaveBtn ? 1 : 0.5,
            }}
          >
            SAVE
          </button>
        </div>
        {selectedProject && (
          <div style={editorContainerStyles}>
            <h1 style={titleStyles}>
              {projectLang.charAt(0).toUpperCase() + projectLang.slice(1)} Code
              Editor{" "}
            </h1>
            <h3 style={subTitleStyles}>{projectName} </h3>
            <div style={editorWrapperStyles}>
              {projectLang === "react" && (
                <SandpackProvider
                  template="react"
                  files={selectedProject.files}
                  theme="dark"
                  options={{
                    externalResources: ["https://cdn.tailwindcss.com"],
                    recompileMode: "immediate",
                    bundlerURL: "https://sandpack-bundler.pages.dev",
                    initMode: "user-visible",
                  }}
                  // customSetup={{
                  //   dependencies: selectedProject.dependencies || {},
                  // }}
                >
                  <SandpackLayout>
                    <div style={mainLayoutStyles}>
                      <div style={fileExplorerStyles}>
                        <div style={fileExplorerHeaderStyles}>
                          <h2 style={fileExplorerTitleStyles}>Files</h2>
                        </div>
                        <div style={{ display: "flex", zIndex: 10 }}>
                          <CustomSandpackFileExplorer />
                        </div>
                      </div>
                      <div style={editorPaneStyles}>
                        <div
                          style={{
                            ...codeEditorStyles,
                            display: isOn === 2 ? "flex" : "none",
                          }}
                        >
                          <SandpackCodeEditor
                            showTabs
                            showLineNumbers
                            showInlineErrors
                            closableTabs
                            wrapContent
                            style={{ height: "100%" }}
                            extensions={[autocompletion()]}
                            extensionsKeymap={[completionKeymap]}
                          />
                        </div>
                        <div
                          style={{
                            ...previewStyles,
                            display: isOn === 2 ? "flex" : "none",
                          }}
                        >
                          <SandpackPreview
                            showNavigator
                            showRefreshButton
                            style={{ height: "100%" }}
                            showOpenInCodeSandbox={false}
                            actionsChildren={false}
                          />
                        </div>

                        <SandpackConsole
                          showHeader={true}
                          standalone={true}
                          maxMessageCount={1000}
                          resetOnPreviewRestart={false}
                          showSyntaxError
                          descendantBindingElements={false}
                          keepPreviousLogs
                          style={{ display: isOn === 1 ? "flex" : "none" }}
                        />
                      </div>
                    </div>
                  </SandpackLayout>
                </SandpackProvider>
              )}
              {projectLang === "python" && (
                <SandpackProvider
                  template="node"
                  files={selectedProject.files}
                  theme="dark"
                  // customSetup={{
                  //   entry: "/main.py",
                  // }}
                  options={{
                    showConsole: true,
                    showConsoleButton: true,
                    activeFile: "/main.py",
                    visibleFiles: ["/main.py"],
                    recompileMode: "immediate",
                    initMode: "user-visible",
                  }}
                >
                  <SandpackLayout>
                    <div style={mainLayoutStyles}>
                      <div style={fileExplorerStyles}>
                        <div style={fileExplorerHeaderStyles}>
                          <h2 style={fileExplorerTitleStyles}>Files</h2>
                        </div>
                        <div style={{ display: "flex", zIndex: 10 }}>
                          <CustomSandpackFileExplorer />
                        </div>
                      </div>
                      <div style={editorPaneStyles}>
                        <div
                          style={{
                            ...codeEditorStyles,
                            display: isOn === 2 ? "flex" : "none",
                          }}
                        >
                          <SandpackCodeEditor
                            showTabs
                            showLineNumbers
                            showInlineErrors
                            closableTabs
                            wrapContent
                            style={{ height: "100%" }}
                            extensions={[autocompletion()]}
                            extensionsKeymap={[completionKeymap]}
                            additionalLanguages={[
                              {
                                name: "python",
                                extensions: ["py"],
                                language: python(),
                              },
                            ]}
                          />
                        </div>
                        <div
                          style={{
                            ...previewStyles,
                            display: isOn === 1 ? "flex" : "none",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "monospace",
                              backgroundColor: "#1e1e1e",
                              color: "#d4d4d4",
                              padding: "1rem",
                              whiteSpace: "pre-wrap",
                              width: "inherit",
                            }}
                          >
                            Output: {codeOutput}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SandpackLayout>
                </SandpackProvider>
              )}
              {projectLang === "webstack" && (
                <SandpackProvider
                  template="static"
                  files={selectedProject.files}
                  theme="dark"
                  options={{
                    showConsole: true,
                    showConsoleButton: true,
                    recompileMode: "immediate",
                    initMode: "user-visible",
                  }}
                >
                  <SandpackLayout>
                    <div style={mainLayoutStyles}>
                      <div style={fileExplorerStyles}>
                        <div style={fileExplorerHeaderStyles}>
                          <h2 style={fileExplorerTitleStyles}>Files</h2>
                        </div>
                        <div style={{ display: "flex", zIndex: 10 }}>
                          <CustomSandpackFileExplorer />
                        </div>
                      </div>
                      <div style={editorPaneStyles}>
                        <div
                          style={{
                            ...codeEditorStyles,
                            display: isOn === 2 ? "flex" : "none",
                          }}
                        >
                          <SandpackCodeEditor
                            showTabs
                            showLineNumbers
                            showInlineErrors
                            closableTabs
                            wrapContent
                            style={{ height: "100%" }}
                            extensions={[autocompletion()]}
                            extensionsKeymap={[completionKeymap]}
                          />
                        </div>
                        <div
                          style={{
                            ...previewStyles,
                            display: isOn === 2 ? "flex" : "none",
                          }}
                        >
                          <SandpackPreview
                            console
                            showNavigator
                            showRefreshButton
                            style={{ height: "100%" }}
                            showOpenInCodeSandbox={false}
                            actionsChildren={false}
                          />
                        </div>

                        <SandpackConsole
                          showHeader={true}
                          standalone={true}
                          maxMessageCount={1000}
                          resetOnPreviewRestart={false}
                          showSyntaxError
                          descendantBindingElements={false}
                          keepPreviousLogs
                          style={{ display: isOn === 1 ? "flex" : "none" }}
                        />
                      </div>
                    </div>
                  </SandpackLayout>
                </SandpackProvider>
              )}
              {projectLang === "node" && (
                <SandpackProvider
                  template="node"
                  files={selectedProject.files}
                  theme="dark"
                >
                  <SandpackLayout>
                    <div style={mainLayoutStyles}>
                      <div style={fileExplorerStyles}>
                        <div style={fileExplorerHeaderStyles}>
                          <h2 style={fileExplorerTitleStyles}>Files</h2>
                        </div>
                        <div style={{ display: "flex", zIndex: 10 }}>
                          <CustomSandpackFileExplorer />
                        </div>
                      </div>
                      <div style={editorPaneStyles}>
                        <div
                          style={{
                            ...codeEditorStyles,
                            display: isOn === 2 ? "flex" : "none",
                          }}
                        >
                          <SandpackCodeEditor
                            showTabs
                            showLineNumbers
                            showInlineErrors
                            closableTabs
                            wrapContent
                            style={{ height: "100%" }}
                            extensions={[autocompletion()]}
                            extensionsKeymap={[completionKeymap]}
                          />
                        </div>
                        <div
                          style={{
                            ...previewStyles,
                            display: isOn === 2 ? "flex" : "none",
                          }}
                        >
                          <SandpackPreview
                            style={{ height: "100%" }}
                            showOpenInCodeSandbox={false}
                          />
                        </div>

                        <SandpackConsole
                          style={{
                            display: isOn === 1 ? "flex" : "none",
                            flex: 1,
                          }}
                        />
                      </div>
                    </div>
                  </SandpackLayout>
                </SandpackProvider>
              )}
            </div>
          </div>
        )}

        {isKeyGenModalOpen && (
          <div style={apiKeyStyles.modalOverlay}>
            <div style={apiKeyStyles.modalContent}>
              <div style={apiKeyStyles.modalHeader}>
                <h3 style={apiKeyStyles.modalTitle}>Your IP EndPoint</h3>
                <button
                  style={{
                    ...apiKeyStyles.closeButton,
                    ...(isKeyGenHovered.closeButton
                      ? apiKeyStyles.closeButtonHover
                      : {}),
                  }}
                  onMouseEnter={() =>
                    setIsKeyGenHovered((prev) => ({
                      ...prev,
                      closeButton: true,
                    }))
                  }
                  onMouseLeave={() =>
                    setIsKeyGenHovered((prev) => ({
                      ...prev,
                      closeButton: false,
                    }))
                  }
                  onClick={() => setIsKeyGenModalOpen(false)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div style={apiKeyStyles.keyContainer}>
                <code style={apiKeyStyles.keyText}>{apiKeyGen}</code>
                <button
                  style={{
                    ...apiKeyStyles.copyButton,
                    ...(isKeyGenHovered.copyButton
                      ? apiKeyStyles.copyButtonHover
                      : {}),
                  }}
                  onMouseEnter={() =>
                    setIsKeyGenHovered((prev) => ({
                      ...prev,
                      copyButton: true,
                    }))
                  }
                  onMouseLeave={() =>
                    setIsKeyGenHovered((prev) => ({
                      ...prev,
                      copyButton: false,
                    }))
                  }
                //   onClick={copyToKeyGenClipboard}
                  title="Copy to clipboard"
                >
                  {isKeyGenCopied ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  )}
                </button>
              </div>

              {isKeyGenCopied && (
                <div style={apiKeyStyles.successMessage}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Copied to clipboard!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CodeEnv;
