import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send, FileText } from "lucide-react";

interface FormData {
  studentName: string;
  group: string;
  planType: string;
  planElement: string;
  day1: string;
  day2: string;
  startDay: string;
  startMonth: string;
  startYear: string;
  planDays: string;
}

interface N8nConfig {
  webhookUrl: string;
  dataWebhookUrl: string;
}

const StudentPlanForm = () => {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    group: "",
    planType: "",
    planElement: "",
    day1: "",
    day2: "",
    startDay: "",
    startMonth: "",
    startYear: "",
    planDays: "",
  });

  // إعدادات n8n و Google Apps Script مخزنة مباشرة في الكود
  const n8nConfig: N8nConfig = {
    webhookUrl: "https://script.google.com/macros/s/AKfycbwe1sABQ8QAjxiPFH9ydaVVLg3ztMTQU7nGUA01qmEcb5uQ8fn4JXH9POgfkBqkX9cL/exec",
    dataWebhookUrl: "https://n8n.jadallah.work/webhook/formform",
  };

  const [groups, setGroups] = useState<string[]>([]);
  const [planTypes, setPlanTypes] = useState<string[]>([]);
  const [planElements, setPlanElements] = useState<string[]>([]);
  const [days] = useState<string[]>([
    "السبت",
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load groups on component mount
  useEffect(() => {
    if (n8nConfig.webhookUrl) {
      loadGroups();
    }
  }, [n8nConfig.webhookUrl]);

  // Load plan types when group changes
  useEffect(() => {
    if (formData.group && n8nConfig.webhookUrl) {
      loadPlanTypes();
    }
  }, [formData.group, n8nConfig.webhookUrl]);

  // Load plan elements when plan type changes
  useEffect(() => {
    if (formData.planType && n8nConfig.webhookUrl) {
      loadPlanElements();
    }
  }, [formData.planType, n8nConfig.webhookUrl]);

  const loadGroups = async () => {
    try {
      setIsLoadingData(true);
      // Google Apps Script يحتاج GET request مع query parameters
      const url = new URL(n8nConfig.webhookUrl);
      url.searchParams.append('action', 'getGroups');
      
      const response = await fetch(url.toString(), {
        method: "GET",
      });
      
      const data = await response.json();
      console.log("Groups response:", data);
      
      // التأكد من أن البيانات array
      const groupsData = Array.isArray(data.groups) ? data.groups : 
                         Array.isArray(data) ? data : [];
      setGroups(groupsData);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast.error("خطأ في تحميل المجموعات");
      setGroups([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadPlanTypes = async () => {
    try {
      setIsLoadingData(true);
      // Google Apps Script يحتاج GET request مع query parameters
      const url = new URL(n8nConfig.webhookUrl);
      url.searchParams.append('action', 'getPlanTypes');
      url.searchParams.append('group', formData.group);
      
      const response = await fetch(url.toString(), {
        method: "GET",
      });
      
      const data = await response.json();
      console.log("Plan types response:", data);
      
      // التأكد من أن البيانات array
      const planTypesData = Array.isArray(data.planTypes) ? data.planTypes : 
                            Array.isArray(data) ? data : [];
      setPlanTypes(planTypesData);
      setFormData(prev => ({ ...prev, planType: "", planElement: "" }));
    } catch (error) {
      console.error("Error loading plan types:", error);
      toast.error("خطأ في تحميل أنواع الخطط");
      setPlanTypes([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadPlanElements = async () => {
    try {
      setIsLoadingData(true);
      // Google Apps Script يحتاج GET request مع query parameters
      const url = new URL(n8nConfig.webhookUrl);
      url.searchParams.append('action', 'getPlanElements');
      url.searchParams.append('planType', formData.planType);
      
      const response = await fetch(url.toString(), {
        method: "GET",
      });
      
      const data = await response.json();
      console.log("Plan elements response:", data);
      
      // التأكد من أن البيانات array
      const planElementsData = Array.isArray(data.planElements) ? data.planElements : 
                               Array.isArray(data) ? data : [];
      setPlanElements(planElementsData);
      setFormData(prev => ({ ...prev, planElement: "" }));
    } catch (error) {
      console.error("Error loading plan elements:", error);
      toast.error("خطأ في تحميل عناصر الخطة");
      setPlanElements([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!n8nConfig.dataWebhookUrl) {
      toast.error("الرجاء إدخال رابط webhook لإرسال البيانات");
      return;
    }

    // Validation
    if (!formData.studentName || !formData.group || !formData.planType || 
        !formData.planElement || !formData.day1 || !formData.day2 ||
        !formData.startDay || !formData.startMonth || !formData.startYear ||
        !formData.planDays) {
      toast.error("الرجاء ملء جميع الحقول");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(n8nConfig.dataWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: formData.studentName,
          group: formData.group,
          planType: formData.planType,
          planElement: formData.planElement,
          days: [formData.day1, formData.day2],
          startDate: `${formData.startDay}/${formData.startMonth}/${formData.startYear}`,
          planDays: formData.planDays,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("تم إرسال البيانات بنجاح!");
        // Reset form
        setFormData({
          studentName: "",
          group: "",
          planType: "",
          planElement: "",
          day1: "",
          day2: "",
          startDay: "",
          startMonth: "",
          startYear: "",
          planDays: "",
        });
      } else {
        toast.error("حدث خطأ أثناء إرسال البيانات");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header with gradient background */}
        <div className="text-center space-y-4 py-12 relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="p-5 gradient-primary rounded-3xl shadow-elegant animate-in fade-in duration-500">
                <FileText className="w-16 h-16 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-3 animate-in slide-in-from-bottom-4 duration-700">
              نظام إدارة خطط الطلاب
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-100">
              نظام متكامل وآلي لإدارة وتوزيع خطط الطلاب بكفاءة عالية
            </p>
          </div>
        </div>

        {/* Instructions Card - Enhanced */}
        <Card className="p-8 gradient-card border-2 border-primary/10 shadow-elegant">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-2xl mb-4 text-primary">كيفية استخدام النظام</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">اختر المجموعة:</strong> سيتم تحميل المجموعات تلقائياً من Google Sheets
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">نوع الخطة:</strong> اختر نوع الخطة المناسبة للطالب
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">عنصر الخطة:</strong> حدد العنصر المطلوب من القائمة
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">أيام الدراسة:</strong> اختر اليومين المخصصين للطالب
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">5</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">تاريخ البدء:</strong> حدد تاريخ بداية تنفيذ الخطة
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">6</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">إرسال:</strong> اضغط على زر الإرسال لحفظ البيانات
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading Indicator */}
          {isLoadingData && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">جاري تحميل البيانات من Google Sheets...</span>
            </div>
          )}
        </Card>

        {/* Main Form */}
        <Card className="p-8 shadow-elegant border-2 border-primary/10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              بيانات الطالب والخطة
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Name */}
            <div className="space-y-2">
              <Label htmlFor="studentName" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                اسم الطالب <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
                placeholder="أدخل اسم الطالب الكامل"
                className="mt-2 h-12 text-base border-2 focus:border-primary"
                required
              />
            </div>

            {/* Group */}
            <div className="space-y-2">
              <Label htmlFor="group" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                المجموعة <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.group}
                onValueChange={(value) =>
                  setFormData({ ...formData, group: value })
                }
                disabled={isLoadingData || groups.length === 0}
                required
              >
                <SelectTrigger className="mt-2 h-12 text-base border-2 focus:border-primary">
                  <SelectValue placeholder={groups.length === 0 ? "جاري التحميل..." : "اختر المجموعة"} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {groups.map((group) => (
                    <SelectItem key={group} value={group} className="text-base">
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Type */}
            <div className="space-y-2">
              <Label htmlFor="planType" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                نوع الخطة <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.planType}
                onValueChange={(value) =>
                  setFormData({ ...formData, planType: value })
                }
                disabled={isLoadingData || !formData.group || planTypes.length === 0}
                required
              >
                <SelectTrigger className="mt-2 h-12 text-base border-2 focus:border-primary">
                  <SelectValue placeholder={!formData.group ? "اختر المجموعة أولاً" : planTypes.length === 0 ? "جاري التحميل..." : "اختر نوع الخطة"} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {planTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-base">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Element */}
            <div className="space-y-2">
              <Label htmlFor="planElement" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                عنصر الخطة <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.planElement}
                onValueChange={(value) =>
                  setFormData({ ...formData, planElement: value })
                }
                disabled={isLoadingData || !formData.planType || planElements.length === 0}
                required
              >
                <SelectTrigger className="mt-2 h-12 text-base border-2 focus:border-primary">
                  <SelectValue placeholder={!formData.planType ? "اختر نوع الخطة أولاً" : planElements.length === 0 ? "جاري التحميل..." : "اختر عنصر الخطة"} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {planElements.map((element) => (
                    <SelectItem key={element} value={element} className="text-base">
                      {element}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Days */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                أيام الدراسة <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day1" className="text-sm text-muted-foreground">
                    اليوم الأول
                  </Label>
                  <Select
                    value={formData.day1}
                    onValueChange={(value) =>
                      setFormData({ ...formData, day1: value })
                    }
                    required
                  >
                    <SelectTrigger className="h-12 text-base border-2 focus:border-primary">
                      <SelectValue placeholder="اختر اليوم الأول" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {days.map((day) => (
                        <SelectItem key={day} value={day} className="text-base">
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day2" className="text-sm text-muted-foreground">
                    اليوم الثاني
                  </Label>
                  <Select
                    value={formData.day2}
                    onValueChange={(value) =>
                      setFormData({ ...formData, day2: value })
                    }
                    required
                  >
                    <SelectTrigger className="h-12 text-base border-2 focus:border-primary">
                      <SelectValue placeholder="اختر اليوم الثاني" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {days.map((day) => (
                        <SelectItem key={day} value={day} className="text-base">
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                تاريخ بدء الخطة <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div>
                  <Input
                    type="number"
                    placeholder="اليوم"
                    min="1"
                    max="31"
                    value={formData.startDay}
                    onChange={(e) =>
                      setFormData({ ...formData, startDay: e.target.value })
                    }
                    className="h-12 text-base border-2 focus:border-primary text-center"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="الشهر"
                    min="1"
                    max="12"
                    value={formData.startMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, startMonth: e.target.value })
                    }
                    className="h-12 text-base border-2 focus:border-primary text-center"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="السنة"
                    min="2020"
                    max="2100"
                    value={formData.startYear}
                    onChange={(e) =>
                      setFormData({ ...formData, startYear: e.target.value })
                    }
                    className="h-12 text-base border-2 focus:border-primary text-center"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Plan Days */}
            <div className="space-y-2">
              <Label htmlFor="planDays" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                عدد أيام الخطة <span className="text-destructive">*</span>
              </Label>
              <Input
                id="planDays"
                type="number"
                min="1"
                value={formData.planDays}
                onChange={(e) =>
                  setFormData({ ...formData, planDays: e.target.value })
                }
                placeholder="مثال: 30 يوم"
                className="mt-2 h-12 text-base border-2 focus:border-primary"
                required
              />
            </div>

            {/* Divider */}
            <div className="pt-4">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gradient-primary text-lg py-7 shadow-elegant hover:shadow-xl transition-all duration-300 text-primary-foreground font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-6 w-6 animate-spin" />
                  جاري الإرسال والمعالجة...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-6 w-6" />
                  إرسال وحفظ البيانات
                </>
              )}
            </Button>
            
            {/* Success Message Hint */}
            <p className="text-center text-sm text-muted-foreground mt-2">
              سيتم إرسال البيانات إلى Google Sheets تلقائياً
            </p>
          </form>
        </Card>

        {/* Technical Info Card */}
        <Card className="p-6 bg-muted/30 border-2 border-muted">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-secondary/10 rounded-xl">
              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-2 text-foreground">ملاحظات تقنية</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">•</span>
                  <span>النظام متصل بـ Google Sheets عبر n8n automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">•</span>
                  <span>جميع البيانات يتم حفظها تلقائياً بعد الإرسال</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">•</span>
                  <span>القوائم المنسدلة يتم تحديثها ديناميكياً من الملف</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentPlanForm;
