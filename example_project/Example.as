package
{
	import flash.display.Sprite;
	import flash.text.TextField;
	
	public class Example extends Sprite
	{
		public function Example()
		{
			trace("hello world");
			var tf:TextField = new TextField();
			tf.text = "hello world";
			addChild(tf);
		}
	}
}
