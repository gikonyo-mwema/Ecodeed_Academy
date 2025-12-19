import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Alert, Badge, Spinner } from 'flowbite-react';
import { HiMail, HiUsers, HiTrendingUp, HiDownload } from 'react-icons/hi';

export default function DashNewsletter() {
  const { currentUser } = useSelector((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsletterStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/messages/newsletter/stats', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch newsletter statistics');
        }

        const data = await response.json();
        setStats(data.data);
      } catch (error) {
        setError(error.message);
        console.error('Newsletter stats error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isAdmin) {
      fetchNewsletterStats();
    }
  }, [currentUser]);

  const exportSubscribers = async () => {
    try {
      // This would ideally be a CSV export endpoint
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Email,Subscribed Date,Source\n"
        + stats.recentSubscribers.map(sub => 
            `${sub.email},${new Date(sub.subscribedAt).toLocaleDateString()},${sub.source}`
          ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Alert color="failure">
          <span className="font-medium">Access Denied!</span> Only administrators can view newsletter statistics.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="xl" />
        <span className="ml-3 text-lg">Loading newsletter statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Alert color="failure">
          <span className="font-medium">Error!</span> {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Newsletter Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage and monitor your newsletter subscribers
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Subscribers
              </p>
              <p className="text-3xl font-bold text-brand-green">
                {stats?.totalSubscribers || 0}
              </p>
            </div>
            <HiUsers className="text-4xl text-brand-green" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unsubscribed
              </p>
              <p className="text-3xl font-bold text-gray-500">
                {stats?.totalUnsubscribed || 0}
              </p>
            </div>
            <HiMail className="text-4xl text-gray-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Growth Rate
              </p>
              <p className="text-3xl font-bold text-brand-blue">
                {stats?.totalSubscribers > 0 
                  ? Math.round((stats.totalSubscribers / (stats.totalSubscribers + stats.totalUnsubscribed)) * 100)
                  : 0}%
              </p>
            </div>
            <HiTrendingUp className="text-4xl text-brand-blue" />
          </div>
        </div>
      </div>

      {/* Recent Subscribers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Subscribers
            </h2>
            <Button
              onClick={exportSubscribers}
              color="gray"
              size="sm"
              className="flex items-center gap-2"
            >
              <HiDownload />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Subscribed Date</Table.HeadCell>
              <Table.HeadCell>Source</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {stats?.recentSubscribers?.length > 0 ? (
                stats.recentSubscribers.map((subscriber) => (
                  <Table.Row 
                    key={subscriber._id} 
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {subscriber.email}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="info" size="sm">
                        {subscriber.source || 'unknown'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="success" size="sm">
                        Active
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No subscribers found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Newsletter Integration Status
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>✅ Contact form integration: Active</p>
          <p>✅ Newsletter signup: Active (RightSidebar)</p>
          <p>✅ Email notifications: Configured</p>
          <p>✅ Unsubscribe functionality: Available</p>
          <p>✅ Rate limiting: 5 requests/hour per IP</p>
        </div>
      </div>
    </div>
  );
}
