import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Camera, Send, Loader2, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveReport, getUserReports, Report } from '@/lib/storage';
import { sendReportEmail } from '@/lib/emailService';
import { fetchLocationFromCoordinates, getCurrentPosition } from '@/lib/geolocation';
import { reportSchema, validatePhoto } from '@/lib/validation';

const ISSUE_TYPES = [
  { value: 'littering', label: 'Littering', icon: '🗑️' },
  { value: 'illegal-dumping', label: 'Illegal Dumping', icon: '🚛' },
  { value: 'tree-cutting', label: 'Tree Cutting', icon: '🪓' },
  { value: 'water-pollution', label: 'Water Pollution', icon: '💧' },
  { value: 'air-pollution', label: 'Air Pollution', icon: '💨' },
  { value: 'noise-pollution', label: 'Noise Pollution', icon: '🔊' },
  { value: 'wildlife-issue', label: 'Wildlife Issue', icon: '🦊' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-success/10 text-success' },
  { value: 'medium', label: 'Medium', color: 'bg-warning/10 text-warning' },
  { value: 'high', label: 'High', color: 'bg-destructive/10 text-destructive' },
  { value: 'critical', label: 'Critical', color: 'bg-destructive text-destructive-foreground' },
];

const Reports: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [issueType, setIssueType] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [userReports, setUserReports] = useState<Report[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      if (user) {
        const reports = await getUserReports(user.id);
        setUserReports(reports);
      }
    };
    loadReports();
  }, [user]);

  const detectLocation = async () => {
    setDetectingLocation(true);
    
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const result = await fetchLocationFromCoordinates(latitude, longitude);
      
      setLocation(result.location);
      toast({
        title: 'Location detected! 📍',
        description: result.error 
          ? `Using coordinates (${result.error})`
          : 'Your location has been auto-filled.',
      });
    } catch (error: any) {
      toast({
        title: 'Location error',
        description: error.message || 'Please allow location access or enter manually.',
        variant: 'destructive',
      });
    } finally {
      setDetectingLocation(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate photo
      const validation = validatePhoto(file);
      if (!validation.valid) {
        toast({
          title: 'Invalid photo',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate with Zod
    const result = reportSchema.safeParse({ issueType, location, description, priority });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      const report = await saveReport({
        user_id: user.id,
        issue_type: issueType,
        location,
        photo_url: photo || null,
        description,
        priority,
      });
      
      if (!report) {
        throw new Error('Failed to save report');
      }
      
      // Reload reports
      const reports = await getUserReports(user.id);
      setUserReports(reports);
      
      // Send email via edge function
      const emailSent = await sendReportEmail({
        from_name: profile?.name || 'User',
        from_email: profile?.email || user.email || 'anonymous@dreamers.app',
        phone: profile?.phone || undefined,
        action_type: 'Report',
        subject: `New Report: ${issueType}`,
        message: description,
        report_type: ISSUE_TYPES.find(t => t.value === issueType)?.label || issueType,
        location,
        priority,
        photo_base64: photo,
      });
      
      toast({
        title: 'Report Submitted! 🎉',
        description: emailSent 
          ? 'Your report has been submitted and email notification sent.'
          : 'Your report has been saved successfully.',
      });
      
      // Reset form
      setIssueType('');
      setLocation('');
      setPhoto('');
      setDescription('');
      setPriority('medium');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-info" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span>📝</span> Report an Issue
            </h1>
            <p className="text-muted-foreground mt-2">
              Help us identify environmental issues in your area
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Form */}
            <Card className="gradient-card border-0 shadow-card animate-slide-up">
              <CardHeader>
                <CardTitle>New Report</CardTitle>
                <CardDescription>
                  Fill in the details about the environmental issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue-type">Issue Type *</Label>
                    <Select value={issueType} onValueChange={setIssueType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ISSUE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.issueType && <p className="text-sm text-destructive">{errors.issueType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter or detect location"
                        maxLength={500}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={detectLocation}
                        disabled={detectingLocation}
                      >
                        {detectingLocation ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo Evidence (max 5MB)</Label>
                    <div className="flex gap-2">
                      <Input
                        ref={fileInputRef}
                        id="photo"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {photo ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                    </div>
                    {photo && (
                      <div className="mt-2 relative rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description * (10-2000 characters)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      className="min-h-[100px]"
                      maxLength={2000}
                      required
                    />
                    <p className="text-xs text-muted-foreground">{description.length}/2000 characters</p>
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="flex flex-wrap gap-2">
                      {PRIORITIES.map((p) => (
                        <Button
                          key={p.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`${priority === p.value ? p.color + ' border-2' : ''}`}
                          onClick={() => setPriority(p.value as typeof priority)}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                    {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Previous Reports */}
            <Card className="gradient-card border-0 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📋</span> Your Reports
                </CardTitle>
                <CardDescription>
                  {userReports.length} reports submitted
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userReports.length > 0 ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {userReports.map((report) => {
                      const issueInfo = ISSUE_TYPES.find(t => t.value === report.issue_type);
                      const priorityInfo = PRIORITIES.find(p => p.value === report.priority);
                      return (
                        <div
                          key={report.id}
                          className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{issueInfo?.icon}</span>
                              <span className="font-medium">{issueInfo?.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(report.status)}
                              <Badge variant="secondary" className={priorityInfo?.color}>
                                {priorityInfo?.label}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{report.location}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <span className="text-4xl block mb-4">📭</span>
                    <p>No reports submitted yet</p>
                    <p className="text-sm mt-1">Start by submitting your first report!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
