import { json } from '@sveltejs/kit';

export async function GET() {
	return json(
		[
			{
				title: 'accusamus beatae ad facilis cum similique qui sunt',
				thumbnailUrl: 'https://picsum.photos/150?random=1'
			},
			{
				title: 'reprehenderit est deserunt velit ipsam',
				thumbnailUrl: 'https://picsum.photos/150?random=2'
			},
			{
				title: 'officia porro iure quia iusto qui ipsa ut modi',
				thumbnailUrl: 'https://picsum.photos/150?random=3'
			},
			{
				title: 'culpa odio esse rerum omnis laboriosam voluptate repudiandae',
				thumbnailUrl: 'https://picsum.photos/150?random=4'
			},
			{
				title: 'natus nisi omnis corporis facere molestiae rerum in',
				thumbnailUrl: 'https://picsum.photos/150?random=5'
			},
			{
				title: 'accusamus ea aliquid et amet sequi nemo',
				thumbnailUrl: 'https://picsum.photos/150?random=6'
			},
			{
				title: 'officia delectus consequatur vero aut veniam explicabo molestias',
				thumbnailUrl: 'https://picsum.photos/150?random=7'
			},
			{
				title: 'aut porro officiis laborum odit ea laudantium corporis',
				thumbnailUrl: 'https://picsum.photos/150?random=8'
			},
			{
				title: 'qui eius qui autem sed',
				thumbnailUrl: 'https://picsum.photos/150?random=9'
			},
			{
				title: 'beatae et provident et ut vel',
				thumbnailUrl: 'https://picsum.photos/150?random=10'
			},
			{
				title: 'nihil at amet non hic quia qui',
				thumbnailUrl: 'https://picsum.photos/150?random=11'
			},
			{
				title: 'mollitia soluta ut rerum eos aliquam consequatur perspiciatis maiores',
				thumbnailUrl: 'https://picsum.photos/150?random=12'
			},
			{
				title: 'repudiandae iusto deleniti rerum',
				thumbnailUrl: 'https://picsum.photos/150?random=13'
			},
			{
				title: 'est necessitatibus architecto ut laborum',
				thumbnailUrl: 'https://picsum.photos/150?random=14'
			},
			{
				title: 'harum dicta similique quis dolore earum ex qui',
				thumbnailUrl: 'https://picsum.photos/150?random=15'
			},
			{
				title: 'iusto sunt nobis quasi veritatis quas expedita voluptatum deserunt',
				thumbnailUrl: 'https://picsum.photos/150?random=16'
			},
			{
				title: 'natus doloribus necessitatibus ipsa',
				thumbnailUrl: 'https://picsum.photos/150?random=17'
			},
			{
				title: 'laboriosam odit nam necessitatibus et illum dolores reiciendis',
				thumbnailUrl: 'https://picsum.photos/150?random=18'
			},
			{
				title: 'perferendis nesciunt eveniet et optio a',
				thumbnailUrl: 'https://picsum.photos/150?random=19'
			},
			{
				title: 'assumenda voluptatem laboriosam enim consequatur veniam placeat reiciendis error',
				thumbnailUrl: 'https://picsum.photos/150?random=20'
			}
		],
		{ headers: { 'Access-Control-Allow-Origin': '*' } }
	);
}
