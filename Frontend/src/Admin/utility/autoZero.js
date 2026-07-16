import api from "../../service/api.js";
import toast from "react-hot-toast";

export const autoZeroMissedTasks = async () => {
  try {    

    const res = await api.get("/projects");
    const allProjects = res.data || [];
    
    const updatePromises = [];
    const zeroedTasks = [];

    allProjects.forEach((project) => {
      (project.tasks || []).forEach((task) => {
        const today = new Date();
        const deadline = task.endDate ? new Date(task.endDate) : null;
        const shouldZero = deadline && deadline < today && !task.completed;
        
        if (shouldZero && task.obtainedMarks > 0) {
          updatePromises.push(
            api.put(`/projects/${project._id}/tasks/${task._id}`, {
              obtainedMarks: 0,
              completed: false
            })
          );
          zeroedTasks.push({
            taskName: task.name,
            projectName: project.projectName,
            userId: task.user
          });
        }
      });
    });

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`✅ ${updatePromises.length} task(s) auto-zeroed due to missed deadlines`);
      return zeroedTasks;
    }
    
    console.log("✅ No tasks needed auto-zero");
    return [];
  } catch (error) {
    console.error("❌ Error auto-zeroing tasks:", error);
    return [];
  }
};