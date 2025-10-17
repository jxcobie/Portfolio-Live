'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Search,
  Eye,
  Trash2,
  MailOpen,
  Reply,
  ExternalLink,
  Filter,
  AlertCircle,
} from 'lucide-react';

interface Message {
  id: number;
  attributes: {
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead?: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState<string>('');
  const [operationLoading, setOperationLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let filtered = messages;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (message) =>
          message.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.attributes.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.attributes.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.attributes.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by read status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((message) => {
        const isRead = message.attributes.isRead === true;
        return filterStatus === 'read' ? isRead : !isRead;
      });
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, filterStatus]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:1337/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      } else {
        setError('Failed to fetch messages. Please try again.');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      setOperationLoading(messageId);
      const response = await fetch(`http://localhost:1337/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: { isRead: true },
        }),
      });

      if (response.ok) {
        setMessages(
          messages.map((msg) =>
            msg.id === messageId ? { ...msg, attributes: { ...msg.attributes, isRead: true } } : msg
          )
        );
      } else {
        setError('Failed to mark message as read.');
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      setError('Network error. Please try again.');
    } finally {
      setOperationLoading(null);
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      setOperationLoading(messageId);
      const response = await fetch(`http://localhost:1337/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } else {
        setError('Failed to delete message.');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      setError('Network error. Please try again.');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    setReplyContent(
      `Hi ${message.attributes.name},\n\nThank you for reaching out regarding "${message.attributes.subject}".\n\n`
    );
  };

  const sendReply = () => {
    if (replyTo && replyContent.trim()) {
      const mailto = `mailto:${replyTo.attributes.email}?subject=Re: ${replyTo.attributes.subject}&body=${encodeURIComponent(replyContent)}`;
      window.open(mailto);
      setReplyTo(null);
      setReplyContent('');
    } else {
      setError('Please enter a reply message before sending.');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600">Contact inquiries and communications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{messages.length} total</Badge>
          <Badge variant="destructive">
            {messages.filter((m) => !m.attributes.isRead).length} unread
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setError('')}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-muted-foreground h-4 w-4" />
              <Select
                value={filterStatus}
                onValueChange={(value: 'all' | 'read' | 'unread') => setFilterStatus(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inbox ({filteredMessages.length})</CardTitle>
          <CardDescription>Manage contact inquiries from your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow
                      key={message.id}
                      className={!message.attributes.isRead ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p
                            className={`font-medium ${!message.attributes.isRead ? 'font-bold' : ''}`}
                          >
                            {message.attributes.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {message.attributes.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className={!message.attributes.isRead ? 'font-semibold' : ''}>
                          {message.attributes.subject}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {getTimeAgo(message.attributes.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={message.attributes.isRead ? 'secondary' : 'default'}>
                          {message.attributes.isRead ? (
                            <>
                              <MailOpen className="mr-1 h-3 w-3" />
                              Read
                            </>
                          ) : (
                            <>
                              <Mail className="mr-1 h-3 w-3" />
                              New
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMessage(message);
                              if (!message.attributes.isRead) {
                                markAsRead(message.id);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReply(message)}>
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`mailto:${message.attributes.email}`}>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMessage(message.id)}
                            disabled={operationLoading === message.id}
                          >
                            {operationLoading === message.id ? (
                              <div className="border-destructive h-4 w-4 animate-spin rounded-full border-b-2" />
                            ) : (
                              <Trash2 className="text-destructive h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredMessages.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center">
                        <div className="text-muted-foreground">
                          {searchTerm || filterStatus !== 'all'
                            ? 'No messages found matching your criteria.'
                            : 'No messages yet.'}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.attributes.subject}</DialogTitle>
            <DialogDescription>
              From {selectedMessage?.attributes.name} ({selectedMessage?.attributes.email}){' • '}
              {selectedMessage && getTimeAgo(selectedMessage.attributes.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.attributes.message}
                </p>
              </div>

              <div className="flex gap-2 border-t pt-4">
                <Button onClick={() => handleReply(selectedMessage)} className="flex-1">
                  <Reply className="mr-2 h-4 w-4" />
                  Reply
                </Button>
                <Button variant="outline" asChild>
                  <a href={`mailto:${selectedMessage.attributes.email}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Email
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteMessage(selectedMessage.id);
                    setSelectedMessage(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={!!replyTo} onOpenChange={() => setReplyTo(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {replyTo?.attributes.name}</DialogTitle>
            <DialogDescription>Compose a reply to {replyTo?.attributes.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={`Re: ${replyTo?.attributes.subject || ''}`}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={8}
                placeholder="Write your reply..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={sendReply} disabled={!replyContent.trim()}>
                <Reply className="mr-2 h-4 w-4" />
                Send Reply (Opens Email Client)
              </Button>
              <Button variant="outline" onClick={() => setReplyTo(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
