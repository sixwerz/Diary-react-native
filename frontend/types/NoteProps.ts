export default interface NoteProps {
  noteId: number;
  noteText: string;
  noteTitle: string;
  noteCreatedAt: string;
  deletedAt?: string;
  status: 'active' | 'deleted'
  handleDeleteNote?(noteId: number): void;
  returnNote?(noteId: number): void;
}