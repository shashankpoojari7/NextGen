import { ApiResponse } from "@/lib/ApiResponse";
import { axiosInstance } from "@/services/axios";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface addCommentData {
  postId: string;
  comment: string;
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: addCommentData) => {
      const response = await axiosInstance.post<ApiResponse>(
        `/api/posts/comment/add`,
        data
      );

      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    },

    onMutate: async ({ postId, comment }) => {
      await queryClient.cancelQueries({ queryKey: ['post-comments', postId] });

      const previousComments = queryClient.getQueryData(['post-comments', postId]);

      queryClient.setQueryData(['post-comments', postId], (old: any) => {
        const existing = Array.isArray(old) ? old : [];
          return [
            ...existing,
            { id: "temp-id", text: comment, createdAt: new Date(), temp: true }
          ];
      })

      return { previousComments };
    },

    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      toast.success('Comment posted')
    },

    onError: (_err, { postId }, ctx) => {
      queryClient.setQueryData(['post-comments', postId], ctx?.previousComments);
      toast.error(_err.message || "Failed to post comment");
    }
  });
}
