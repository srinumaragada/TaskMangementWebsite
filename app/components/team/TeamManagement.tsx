// components/team/TeamManagement.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/redux/store/store";
import { addProjectMember, removeProjectMember } from "@/app/redux/slice/projects/projectsSlice";
import { Modal } from "../ui/Modal";
import { Avatar } from "../ui/Avatar";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { toast } from "react-hot-toast";

interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface TeamManagementProps {
  projectId: string;
  members: Member[];
  createdBy: string; 
}

export default function TeamManagement({
  projectId,
  members,
  createdBy,
}: TeamManagementProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddMember = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const result = await dispatch(addProjectMember({ projectId, email }));
      
      if (addProjectMember.fulfilled.match(result)) {
        toast.success("Member added successfully");
        setEmail("");
        setIsAddModalOpen(false);
      } else if (addProjectMember.rejected.match(result)) {
        throw new Error(result.payload?.message || "Failed to add member");
      }
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (memberId === createdBy) {
      toast.error("Cannot remove project creator");
      return;
    }
    
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const result = await dispatch(removeProjectMember({ projectId, memberId }));
      
      if (removeProjectMember.fulfilled.match(result)) {
        toast.success("Member removed successfully");
      } else if (removeProjectMember.rejected.match(result)) {
        throw new Error(result.payload?.message || "Failed to remove member");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Team Members</h3>
        <Button
          onClick={() => setIsAddModalOpen(true)}

          size="sm"
        >
          Add Member
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {members.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No team members yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      name={member.name || member.email} 
                      src={member.avatar} 
                    />
                    <div>
                      <p className="font-medium">
                        {member.name || member.email}
                        {member._id === createdBy && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Creator
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  {member._id !== createdBy && (
                    <Button
                      onClick={() => handleRemoveMember(member._id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setError("");
        }}
        title="Add Team Member"
      >
        <div className="space-y-4">
          <Input
            label="User Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Enter user's email"
            required
            error={error}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsAddModalOpen(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember} 
              isLoading={isLoading}
              disabled={isLoading}
            >
              Add Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}