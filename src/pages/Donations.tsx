import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/integrations/supabase/client'; // Replaced with API client
import { Heart, DollarSign, Users, Target } from 'lucide-react';
import Navigation from '@/components/ui/navigation';

interface Donation {
  id: string;
  amount: number;
  donor_name: string;
  message: string;
  is_anonymous: boolean;
  created_at: string;
}

const Donations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching donations:', error);
    } else {
      setDonations(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from('donations').insert({
        amount: parseFloat(amount),
        donor_name: donorName,
        donor_email: donorEmail,
        message,
        is_anonymous: isAnonymous,
        user_id: '00000000-0000-0000-0000-000000000000' // placeholder for demo
      });

      if (error) throw error;

      toast({
        title: "Thank you for your donation!",
        description: "Your contribution helps support our alumni community.",
      });

      // Reset form
      setAmount('');
      setDonorName('');
      setDonorEmail('');
      setMessage('');
      setIsAnonymous(false);
      
      // Refresh donations
      fetchDonations();
    } catch (error) {
      toast({
        title: "Error processing donation",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Support Our Alumni Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your donations help fund scholarships, events, and programs that strengthen 
            our alumni network and support current students.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">${totalDonations.toLocaleString()}</div>
              <div className="text-muted-foreground">Total Raised</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">{donations.length}</div>
              <div className="text-muted-foreground">Contributors</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">$50,000</div>
              <div className="text-muted-foreground">Annual Goal</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Make a Donation
              </CardTitle>
              <CardDescription>
                Help us continue building a strong alumni community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="donorName">Full Name</Label>
                    <Input
                      id="donorName"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="donorEmail">Email</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Donation Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share why you're supporting the alumni community..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(!!checked)}
                  />
                  <Label htmlFor="anonymous">Make this donation anonymous</Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Donate Now'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Donations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Contributors</CardTitle>
              <CardDescription>
                Thank you to our generous supporters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {donations.map((donation) => (
                  <div key={donation.id} className="border-b border-border pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold">
                        {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                      </div>
                      <Badge variant="secondary">
                        ${donation.amount.toLocaleString()}
                      </Badge>
                    </div>
                    {donation.message && (
                      <p className="text-sm text-muted-foreground italic">
                        "{donation.message}"
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {donations.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Be the first to contribute!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Donations;